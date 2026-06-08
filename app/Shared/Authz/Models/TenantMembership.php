<?php

namespace App\Shared\Authz\Models;

use App\Models\User;
use App\Shared\Database\LandlordModel;
use App\Shared\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantMembership extends LandlordModel
{
    protected $table = 'tenant_user_memberships';

    protected $fillable = [
        'tenant_id',
        'user_id',
        'role_id',
        'status',
        'support_access_expires_at',
    ];

    protected function casts(): array
    {
        return [
            'support_access_expires_at' => 'datetime',
        ];
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }
}
