<?php

namespace App\Modules\Tenant\Purchases\Models;

use App\Modules\Tenant\Inventory\Models\Warehouse;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends TenantModel
{
    protected $fillable = [
        'supplier_id',
        'warehouse_id',
        'reference',
        'status',
        'order_date',
        'expected_at',
        'subtotal_amount',
        'received_amount',
        'total_amount',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'order_date' => 'date',
            'expected_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function receipts(): HasMany
    {
        return $this->hasMany(PurchaseReceipt::class);
    }
}

