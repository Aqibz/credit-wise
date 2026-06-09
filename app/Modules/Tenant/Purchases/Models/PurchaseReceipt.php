<?php

namespace App\Modules\Tenant\Purchases\Models;

use App\Modules\Tenant\Inventory\Models\Warehouse;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseReceipt extends TenantModel
{
    protected $fillable = [
        'purchase_order_id',
        'warehouse_id',
        'reference',
        'received_at',
        'notes',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'received_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function purchaseOrder(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrder::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseReceiptItem::class);
    }
}

