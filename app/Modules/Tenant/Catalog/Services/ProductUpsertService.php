<?php

namespace App\Modules\Tenant\Catalog\Services;

use App\Modules\Tenant\Catalog\Models\Product;
use Illuminate\Support\Facades\DB;

class ProductUpsertService
{
    public function handle(array $payload, ?Product $product = null): Product
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $product): Product {
            $product ??= new Product();
            $product->fill($payload)->save();

            return $product->refresh()->load(['brand', 'category', 'pricingPlans']);
        });
    }
}

