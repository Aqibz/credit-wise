<?php

namespace App\Modules\Tenant\Inventory\Models;

use App\Modules\Tenant\Catalog\Models\Product;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryBalance extends TenantModel
{
    protected $fillable = ['warehouse_id', 'product_id', 'on_hand', 'reserved'];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

