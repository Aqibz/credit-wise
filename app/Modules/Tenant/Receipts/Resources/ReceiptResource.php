<?php

namespace App\Modules\Tenant\Receipts\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReceiptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contract_id' => $this->contract_id,
            'customer_id' => $this->customer_id,
            'receipt_number' => $this->receipt_number,
            'receipt_date' => $this->receipt_date?->toDateString(),
            'amount_received' => $this->amount_received,
            'payment_method' => $this->payment_method,
            'external_reference' => $this->external_reference,
            'notes' => $this->notes,
            'meta' => $this->meta ?? [],
            'allocations' => $this->whenLoaded('allocations', fn () => $this->allocations->map(fn ($allocation) => [
                'id' => $allocation->id,
                'installment_id' => $allocation->installment_id,
                'allocated_amount' => $allocation->allocated_amount,
            ])->values()),
            'created_at' => $this->created_at?->toAtomString(),
            'updated_at' => $this->updated_at?->toAtomString(),
        ];
    }
}

