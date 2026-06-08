<?php

namespace App\Shared\Tenancy\Models;

use App\Modules\SuperAdmin\Models\Subscription;
use App\Shared\Database\LandlordModel;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tenant extends LandlordModel
{
    protected $fillable = [
        'name',
        'slug',
        'database',
        'database_host',
        'database_port',
        'database_username',
        'database_password',
        'database_schema',
        'status',
        'provisioned_at',
        'failed_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'database_password' => 'encrypted',
            'provisioned_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function domains(): HasMany
    {
        return $this->hasMany(TenantDomain::class);
    }

    public function activeDomain(): HasOne
    {
        return $this->hasOne(TenantDomain::class)->where('is_primary', true);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
