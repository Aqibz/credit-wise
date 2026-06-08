<?php

namespace App\Modules\Contracts\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'customer_id' => $this->customer_id,
            'customer' => $this->whenLoaded('customer', fn () => [
                'id' => $this->customer->id,
                'name' => $this->customer->name,
                'cnic' => $this->customer->cnic,
            ]),
            'status' => $this->status,
            'cash_price' => $this->cash_price,
            'down_payment' => $this->down_payment,
            'financed_amount' => $this->financed_amount,
            'tenure_months' => $this->tenure_months,
            'monthly_installment' => $this->monthly_installment,
            'product_snapshot' => $this->product_snapshot,
            'plan_snapshot' => $this->plan_snapshot,
            'meta' => $this->meta ?? [],
            'approved_at' => $this->approved_at?->toAtomString(),
            'closed_at' => $this->closed_at?->toAtomString(),
            'created_at' => $this->created_at?->toAtomString(),
            'updated_at' => $this->updated_at?->toAtomString(),
        ];
    }
}
