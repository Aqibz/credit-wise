<?php

namespace App\Modules\Receipts\Models;

use App\Modules\Contracts\Models\Contract;
use App\Modules\Customers\Models\Customer;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Receipt extends TenantModel
{
    protected $fillable = [
        'contract_id',
        'customer_id',
        'receipt_number',
        'receipt_date',
        'amount_received',
        'payment_method',
        'external_reference',
        'idempotency_key',
        'notes',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'receipt_date' => 'date',
            'meta' => 'array',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(ReceiptAllocation::class);
    }
}
