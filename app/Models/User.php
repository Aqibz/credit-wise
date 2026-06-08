<?php

namespace App\Models;

use App\Shared\Authz\Models\Role;
use App\Shared\Authz\Models\TenantMembership;
use App\Shared\Tenancy\Models\Tenant;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Auth\MustVerifyEmail as MustVerifyEmailTrait;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'is_super_admin'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, MustVerifyEmailTrait, Notifiable;

    protected $connection = 'landlord';

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_super_admin' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function memberships(): HasMany
    {
        return $this->hasMany(TenantMembership::class);
    }

    public function membershipFor(?Tenant $tenant): ?TenantMembership
    {
        if ($tenant === null) {
            return null;
        }

        return $this->memberships
            ->firstWhere('tenant_id', $tenant->getKey())
            ?? $this->memberships()->with('role.permissions')->where('tenant_id', $tenant->getKey())->first();
    }

    public function roleFor(?Tenant $tenant): ?Role
    {
        return $this->membershipFor($tenant)?->role;
    }

    public function hasPermissionTo(string $permission, ?Tenant $tenant = null): bool
    {
        if ($this->is_super_admin) {
            return true;
        }

        $role = $this->roleFor($tenant);

        if ($role === null) {
            return false;
        }

        return $role->permissions
            ->pluck('name')
            ->containsStrict($permission);
    }
}
