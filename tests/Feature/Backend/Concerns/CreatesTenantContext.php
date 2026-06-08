<?php

namespace Tests\Feature\Backend\Concerns;

use App\Models\User;
use App\Shared\Authz\Models\Permission;
use App\Shared\Authz\Models\Role;
use App\Shared\Authz\Models\TenantMembership;
use App\Shared\Tenancy\Models\Tenant;

trait CreatesTenantContext
{
    protected function createTenantUserWithPermissions(array $permissionNames): array
    {
        $tenant = Tenant::query()->create([
            'name' => 'Model Town',
            'slug' => 'model-town',
            'database' => env('TENANT_DB_DATABASE', 'database/testing-tenant.sqlite'),
            'status' => 'active',
        ]);

        $role = Role::query()->create([
            'name' => 'Tenant Admin',
            'slug' => 'tenant-admin-'.str()->lower(str()->random(8)),
        ]);

        $permissions = collect($permissionNames)
            ->map(fn (string $name) => Permission::query()->firstOrCreate(['name' => $name]));

        $role->permissions()->sync($permissions->pluck('id'));

        $user = User::factory()->create();

        TenantMembership::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        return [$tenant, $user, $role];
    }
}
