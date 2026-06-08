<?php

namespace App\Modules\Purchases\Services;

use App\Modules\Purchases\Models\PurchaseOrder;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PurchaseOrderUpsertService
{
    public function handle(array $payload, ?PurchaseOrder $purchaseOrder = null): PurchaseOrder
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $purchaseOrder): PurchaseOrder {
            $purchaseOrder ??= new PurchaseOrder();

            $items = collect($payload['items'] ?? []);
            $totals = $this->calculateTotals($items);

            $purchaseOrder->fill(array_merge(
                Arr::except($payload, ['items']),
                [
                    'subtotal_amount' => $totals['subtotal_amount'],
                    'total_amount' => $totals['total_amount'],
                ],
            ))->save();

            $purchaseOrder->items()->delete();

            if ($items->isNotEmpty()) {
                $purchaseOrder->items()->createMany(
                    $items->map(fn (array $item) => [
                        'product_id' => $item['product_id'],
                        'quantity_ordered' => $item['quantity_ordered'],
                        'quantity_received' => $item['quantity_received'] ?? 0,
                        'unit_cost' => $item['unit_cost'],
                        'line_total' => $item['quantity_ordered'] * $item['unit_cost'],
                        'meta' => $item['meta'] ?? null,
                    ])->all(),
                );
            }

            return $purchaseOrder->refresh()->load('items');
        });
    }

    protected function calculateTotals(Collection $items): array
    {
        $subtotal = $items->sum(fn (array $item) => $item['quantity_ordered'] * $item['unit_cost']);

        return [
            'subtotal_amount' => $subtotal,
            'total_amount' => $subtotal,
        ];
    }
}
