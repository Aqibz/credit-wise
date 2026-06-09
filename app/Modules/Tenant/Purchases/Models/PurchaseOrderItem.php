<?php

namespace App\Modules\Tenant\Purchases\Models;

use App\Modules\Tenant\Catalog\Models\Product;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderItem extends TenantModel
{
    protected $fillable = [
        'purchase_order_id',
        'product_id',
        'quantity_ordered',
        'quantity_received',
        'unit_cost',
        'line_total',
        'meta',
    ];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

