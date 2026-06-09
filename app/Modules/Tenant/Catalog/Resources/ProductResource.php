<?php

namespace App\Modules\Tenant\Catalog\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'brand_id' => $this->brand_id,
            'category_id' => $this->category_id,
            'sku' => $this->sku,
            'name' => $this->name,
            'slug' => $this->slug,
            'status' => $this->status,
            'cash_price' => $this->cash_price,
            'meta' => $this->meta ?? [],
            'brand' => $this->whenLoaded('brand', fn () => [
                'id' => $this->brand->id,
                'name' => $this->brand->name,
            ]),
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id,
                'name' => $this->category->name,
            ]),
            'pricing_plans' => $this->whenLoaded('pricingPlans', fn () => PricingPlanResource::collection($this->pricingPlans)),
        ];
    }
}

