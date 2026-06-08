<?php

namespace Tests\Feature\Backend;

use App\Models\User;
use App\Shared\Authz\Models\Role;
use App\Shared\Authz\Models\TenantMembership;
use App\Shared\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CustomerPermissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_creation_is_forbidden_without_permission(): void
    {
        $tenant = Tenant::query()->create([
            'name' => 'Gulberg',
            'slug' => 'gulberg',
            'database' => env('TENANT_DB_DATABASE', 'database/testing-tenant.sqlite'),
            'status' => 'active',
        ]);

        $role = Role::query()->create([
            'name' => 'Viewer',
            'slug' => 'viewer',
        ]);

        $user = User::factory()->create();

        TenantMembership::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        Sanctum::actingAs($user);

        $this->withHeader('X-Tenant', 'gulberg')
            ->postJson('/api/v1/app/customers', [
                'name' => 'Denied User',
                'cnic' => '35202-0000000-0',
                'status' => 'active',
            ])
            ->assertForbidden();
    }
}
