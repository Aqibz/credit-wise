<?php

namespace App\Modules\Purchases\Services;

use App\Modules\Purchases\Models\Supplier;
use Illuminate\Support\Facades\DB;

class SupplierUpsertService
{
    public function handle(array $payload, ?Supplier $supplier = null): Supplier
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $supplier): Supplier {
            $supplier ??= new Supplier();
            $supplier->fill($payload)->save();

            return $supplier->refresh();
        });
    }
}
