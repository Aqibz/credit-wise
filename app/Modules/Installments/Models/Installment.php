<?php

namespace App\Modules\Installments\Models;

use App\Modules\Contracts\Models\Contract;
use App\Modules\Receipts\Models\ReceiptAllocation;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Installment extends TenantModel
{
    protected $fillable = [
        'contract_id',
        'sequence',
        'due_date',
        'scheduled_amount',
        'principal_amount',
        'paid_amount',
        'outstanding_amount',
        'status',
        'paid_at',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'paid_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function allocations(): HasMany
    {
        return $this->hasMany(ReceiptAllocation::class);
    }
}
