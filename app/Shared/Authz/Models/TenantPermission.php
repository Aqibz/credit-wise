<?php

namespace App\Shared\Authz\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TenantPermission extends TenantModel
{
    protected $table = 'permissions';

    protected $fillable = [
        'name',
        'description',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(TenantRole::class, 'role_permission', 'permission_id', 'role_id');
    }
}
