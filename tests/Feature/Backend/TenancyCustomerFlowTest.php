<?php

namespace Tests\Feature\Backend;

use App\Models\User;
use App\Modules\Customers\Models\Customer;
use App\Shared\Authz\Models\Permission;
use App\Shared\Authz\Models\Role;
use App\Shared\Authz\Models\TenantMembership;
use App\Shared\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TenancyCustomerFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_tenant_customer_creation_is_scoped_and_audited(): void
    {
        $tenant = Tenant::query()->create([
            'name' => 'Model Town',
            'slug' => 'model-town',
            'database' => env('TENANT_DB_DATABASE', 'database/testing-tenant.sqlite'),
            'status' => 'active',
        ]);

        $role = Role::query()->create([
            'name' => 'Tenant Admin',
            'slug' => 'tenant-admin',
        ]);

        $permissionNames = ['customers.view', 'customers.create', 'customers.update', 'customers.delete'];

        $permissions = collect($permissionNames)
            ->map(fn (string $name) => Permission::query()->create(['name' => $name]));

        $role->permissions()->sync($permissions->pluck('id'));

        $user = User::factory()->create();

        TenantMembership::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        Customer::query()->count();

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Tenant', 'model-town')->postJson('/api/v1/app/customers', [
            'name' => 'Ali Raza',
            'cnic' => '35202-1234567-1',
            'phone' => '03001234567',
            'status' => 'active',
            'guarantors' => [
                [
                    'name' => 'Ahmed Khan',
                    'cnic' => '35202-7654321-0',
                ],
            ],
        ]);

        $response
            ->assertCreated()
            ->assertHeader('X-Tenant', 'model-town')
            ->assertJsonPath('data.name', 'Ali Raza');
    }
}
