<?php

namespace App\Modules\Tenant\Catalog\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PricingPlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'tenure_months' => $this->tenure_months,
            'down_payment' => $this->down_payment,
            'financed_amount' => $this->financed_amount,
            'installment_amount' => $this->installment_amount,
            'total_amount' => $this->total_amount,
            'status' => $this->status,
            'meta' => $this->meta ?? [],
        ];
    }
}

