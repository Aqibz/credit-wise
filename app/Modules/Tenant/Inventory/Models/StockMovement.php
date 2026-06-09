<?php

namespace App\Modules\Tenant\Inventory\Models;

use App\Modules\Tenant\Catalog\Models\Product;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends TenantModel
{
    protected $fillable = [
        'warehouse_id',
        'product_id',
        'type',
        'quantity',
        'unit_cost',
        'reference_type',
        'reference_id',
        'occurred_at',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

