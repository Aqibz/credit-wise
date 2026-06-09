<?php

namespace App\Modules\Tenant\Inventory\Models;

use App\Modules\Tenant\Purchases\Models\PurchaseOrder;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends TenantModel
{
    protected $fillable = ['name', 'code', 'status', 'meta'];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function balances(): HasMany
    {
        return $this->hasMany(InventoryBalance::class);
    }

    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}

