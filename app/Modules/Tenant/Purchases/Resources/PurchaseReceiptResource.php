<?php

namespace App\Modules\Tenant\Purchases\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'purchase_order_id' => $this->purchase_order_id,
            'warehouse_id' => $this->warehouse_id,
            'reference' => $this->reference,
            'received_at' => $this->received_at?->toAtomString(),
            'notes' => $this->notes,
            'meta' => $this->meta ?? [],
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'purchase_order_item_id' => $item->purchase_order_item_id,
                'product_id' => $item->product_id,
                'quantity_received' => $item->quantity_received,
                'unit_cost' => $item->unit_cost,
                'line_total' => $item->line_total,
            ])->values()),
        ];
    }
}

