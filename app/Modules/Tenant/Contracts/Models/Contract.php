<?php

namespace App\Modules\Tenant\Contracts\Models;

use App\Modules\Tenant\Customers\Models\Customer;
use App\Modules\Tenant\Installments\Models\Installment;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contract extends TenantModel
{
    protected $fillable = [
        'reference',
        'customer_id',
        'status',
        'cash_price',
        'down_payment',
        'financed_amount',
        'tenure_months',
        'monthly_installment',
        'product_snapshot',
        'plan_snapshot',
        'meta',
        'approved_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'product_snapshot' => 'array',
            'plan_snapshot' => 'array',
            'meta' => 'array',
            'approved_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function installments(): HasMany
    {
        return $this->hasMany(Installment::class);
    }
}

