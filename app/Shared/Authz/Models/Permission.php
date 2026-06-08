<?php

namespace App\Shared\Authz\Models;

use App\Shared\Database\LandlordModel;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends LandlordModel
{
    protected $fillable = [
        'name',
        'description',
    ];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_permission');
    }
}
