<?php

namespace App\Modules\Tenant\Inventory\Services;

use App\Modules\Tenant\Inventory\Events\StockMovementRecorded;
use App\Modules\Tenant\Inventory\Models\InventoryBalance;
use App\Modules\Tenant\Inventory\Models\StockMovement;
use DomainException;
use Illuminate\Support\Facades\DB;

class StockMovementService
{
    public function handle(array $payload): StockMovement
    {
        return DB::connection('tenant')->transaction(function () use ($payload): StockMovement {
            $balance = InventoryBalance::query()
                ->where('warehouse_id', $payload['warehouse_id'])
                ->where('product_id', $payload['product_id'])
                ->lockForUpdate()
                ->first();

            if ($balance === null) {
                $balance = InventoryBalance::query()->create([
                    'warehouse_id' => $payload['warehouse_id'],
                    'product_id' => $payload['product_id'],
                    'on_hand' => 0,
                    'reserved' => 0,
                ]);
            }

            $newOnHand = $balance->on_hand + (int) $payload['quantity'];

            if ($newOnHand < 0) {
                throw new DomainException('Stock movement would make on-hand inventory negative.');
            }

            $balance->on_hand = $newOnHand;
            $balance->save();

            $stockMovement = StockMovement::query()->create($payload);

            StockMovementRecorded::dispatch($stockMovement);

            return $stockMovement->refresh();
        });
    }
}

