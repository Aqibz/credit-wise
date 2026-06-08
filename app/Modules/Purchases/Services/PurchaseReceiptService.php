<?php

namespace App\Modules\Purchases\Services;

use App\Modules\Inventory\Services\StockMovementService;
use App\Modules\Purchases\Events\PurchaseOrderReceived;
use App\Modules\Purchases\Models\PurchaseOrder;
use App\Modules\Purchases\Models\PurchaseReceipt;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PurchaseReceiptService
{
    public function __construct(
        private readonly StockMovementService $stockMovementService,
    ) {
    }

    public function handle(PurchaseOrder $purchaseOrder, array $payload): PurchaseReceipt
    {
        return DB::connection('tenant')->transaction(function () use ($purchaseOrder, $payload): PurchaseReceipt {
            // The purchase order items are locked so partial receipts cannot oversubscribe the same ordered quantity.
            $items = $purchaseOrder->items()
                ->select(['id', 'purchase_order_id', 'product_id', 'quantity_ordered', 'quantity_received', 'unit_cost'])
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $purchaseReceipt = PurchaseReceipt::query()->create([
                'purchase_order_id' => $purchaseOrder->id,
                'warehouse_id' => $purchaseOrder->warehouse_id,
                'reference' => $payload['reference'],
                'received_at' => $payload['received_at'],
                'notes' => $payload['notes'] ?? null,
                'meta' => $payload['meta'] ?? null,
            ]);

            $receiptItems = collect($payload['items'])->map(function (array $item) use ($items, $payload, $purchaseOrder, $purchaseReceipt): array {
                $purchaseOrderItem = $items->get($item['purchase_order_item_id']);

                if ($purchaseOrderItem === null) {
                    throw new DomainException('Receipt references an invalid purchase order item.');
                }

                $remaining = $purchaseOrderItem->quantity_ordered - $purchaseOrderItem->quantity_received;

                if ($item['quantity_received'] > $remaining) {
                    throw new DomainException('Receipt quantity exceeds the remaining ordered quantity.');
                }

                $purchaseOrderItem->quantity_received += $item['quantity_received'];
                $purchaseOrderItem->save();

                $lineTotal = $item['quantity_received'] * $purchaseOrderItem->unit_cost;

                $this->stockMovementService->handle([
                    'warehouse_id' => $purchaseOrder->warehouse_id,
                    'product_id' => $purchaseOrderItem->product_id,
                    'type' => 'purchase_receipt',
                    'quantity' => $item['quantity_received'],
                    'unit_cost' => $purchaseOrderItem->unit_cost,
                    'reference_type' => PurchaseReceipt::class,
                    'reference_id' => $purchaseReceipt->id,
                    'occurred_at' => $payload['received_at'],
                    'meta' => ['purchase_order_id' => $purchaseOrder->id],
                ]);

                return [
                    'purchase_order_item_id' => $purchaseOrderItem->id,
                    'product_id' => $purchaseOrderItem->product_id,
                    'quantity_received' => $item['quantity_received'],
                    'unit_cost' => $purchaseOrderItem->unit_cost,
                    'line_total' => $lineTotal,
                    'meta' => $item['meta'] ?? null,
                ];
            });

            $purchaseReceipt->items()->createMany($receiptItems->all());

            $purchaseOrder->received_amount = (int) $purchaseOrder->items()->sum('quantity_received');
            $purchaseOrder->status = $this->resolveStatus($items);
            $purchaseOrder->save();

            PurchaseOrderReceived::dispatch($purchaseReceipt->load('items:id,purchase_receipt_id,purchase_order_item_id,product_id,quantity_received,unit_cost,line_total'));

            return $purchaseReceipt->load('items:id,purchase_receipt_id,purchase_order_item_id,product_id,quantity_received,unit_cost,line_total');
        });
    }

    protected function resolveStatus(Collection $items): string
    {
        if ($items->every(fn ($item) => $item->quantity_received >= $item->quantity_ordered)) {
            return 'received';
        }

        if ($items->some(fn ($item) => $item->quantity_received > 0)) {
            return 'partially_received';
        }

        return 'ordered';
    }
}
