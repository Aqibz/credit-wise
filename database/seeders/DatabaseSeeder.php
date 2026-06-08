<?php

namespace Database\Seeders;

use App\Models\User;
use App\Modules\SuperAdmin\Models\Plan;
use App\Shared\Authz\PermissionCatalog;
use App\Shared\Authz\Models\Permission;
use App\Shared\Authz\Models\Role;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = PermissionCatalog::all();

        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate(['name' => $permission]);
        }

        $superAdmin = Role::query()->firstOrCreate(
            ['slug' => 'super-admin'],
            ['name' => 'Super Admin', 'description' => 'Full landlord control'],
        );

        $tenantAdmin = Role::query()->firstOrCreate(
            ['slug' => 'tenant-admin'],
            ['name' => 'Tenant Admin', 'description' => 'Full tenant access'],
        );

        $tenantAdmin->permissions()->sync(
            Permission::query()->pluck('id')->all(),
        );

        Plan::query()->firstOrCreate(
            ['slug' => 'starter'],
            ['name' => 'Starter', 'billing_cycle' => 'monthly', 'price' => 0, 'features' => ['customers', 'contracts', 'installments', 'payments', 'catalog', 'inventory', 'purchases', 'recovery', 'accounts', 'support', 'hr']],
        );

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'is_super_admin' => true,
        ]);
    }
}
