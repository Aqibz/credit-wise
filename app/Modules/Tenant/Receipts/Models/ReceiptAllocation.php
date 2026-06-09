<?php

namespace App\Modules\Tenant\Receipts\Models;

use App\Modules\Tenant\Installments\Models\Installment;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReceiptAllocation extends TenantModel
{
    protected $fillable = [
        'receipt_id',
        'installment_id',
        'allocated_amount',
    ];

    public function receipt(): BelongsTo
    {
        return $this->belongsTo(Receipt::class);
    }

    public function installment(): BelongsTo
    {
        return $this->belongsTo(Installment::class);
    }
}

