<?php

namespace App\Modules\Tenant\Installments\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstallmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contract_id' => $this->contract_id,
            'sequence' => $this->sequence,
            'due_date' => $this->due_date?->toDateString(),
            'scheduled_amount' => $this->scheduled_amount,
            'principal_amount' => $this->principal_amount,
            'paid_amount' => $this->paid_amount,
            'outstanding_amount' => $this->outstanding_amount,
            'status' => $this->status,
            'paid_at' => $this->paid_at?->toAtomString(),
            'meta' => $this->meta ?? [],
            'contract' => $this->whenLoaded('contract', fn () => [
                'id' => $this->contract->id,
                'reference' => $this->contract->reference,
                'customer_id' => $this->contract->customer_id,
            ]),
            'created_at' => $this->created_at?->toAtomString(),
            'updated_at' => $this->updated_at?->toAtomString(),
        ];
    }
}

