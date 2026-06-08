<?php

namespace App\Shared\Tenancy\Models;

use App\Shared\Database\LandlordModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantDomain extends LandlordModel
{
    protected $fillable = [
        'tenant_id',
        'domain',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
