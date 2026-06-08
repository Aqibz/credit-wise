<?php

namespace App\Modules\Customers\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlacklistEntry extends TenantModel
{
    protected $fillable = [
        'customer_id',
        'cnic',
        'reason',
        'status',
        'listed_at',
        'cleared_at',
    ];

    protected function casts(): array
    {
        return [
            'listed_at' => 'datetime',
            'cleared_at' => 'datetime',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }
}
