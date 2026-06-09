<?php

namespace App\Modules\Tenant\Customers\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerGuarantor extends TenantModel
{
    protected $fillable = [
        'customer_id',
        'name',
        'cnic',
        'phone',
        'relationship',
    ];

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}

