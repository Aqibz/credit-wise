<?php

namespace App\Modules\Catalog\Services;

use App\Modules\Catalog\Models\Brand;
use Illuminate\Support\Facades\DB;

class BrandUpsertService
{
    public function handle(array $payload, ?Brand $brand = null): Brand
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $brand): Brand {
            $brand ??= new Brand();
            $brand->fill($payload)->save();

            return $brand->refresh();
        });
    }
}
