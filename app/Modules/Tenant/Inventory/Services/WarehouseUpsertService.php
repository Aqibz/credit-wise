<?php

namespace App\Modules\Tenant\Inventory\Services;

use App\Modules\Tenant\Inventory\Models\Warehouse;
use Illuminate\Support\Facades\DB;

class WarehouseUpsertService
{
    public function handle(array $payload, ?Warehouse $warehouse = null): Warehouse
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $warehouse): Warehouse {
            $warehouse ??= new Warehouse();
            $warehouse->fill($payload)->save();

            return $warehouse->refresh();
        });
    }
}

