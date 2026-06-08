<?php

namespace App\Modules\Purchases\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PurchaseOrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'supplier_id' => $this->supplier_id,
            'warehouse_id' => $this->warehouse_id,
            'reference' => $this->reference,
            'status' => $this->status,
            'order_date' => $this->order_date?->toDateString(),
            'expected_at' => $this->expected_at?->toAtomString(),
            'subtotal_amount' => $this->subtotal_amount,
            'received_amount' => $this->received_amount,
            'total_amount' => $this->total_amount,
            'meta' => $this->meta ?? [],
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'quantity_ordered' => $item->quantity_ordered,
                'quantity_received' => $item->quantity_received,
                'unit_cost' => $item->unit_cost,
                'line_total' => $item->line_total,
            ])->values()),
        ];
    }
}
