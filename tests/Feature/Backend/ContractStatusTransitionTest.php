<?php

namespace Tests\Feature\Backend;

use App\Models\User;
use App\Modules\Tenant\Contracts\Models\Contract;
use App\Modules\Tenant\Customers\Models\Customer;
use App\Shared\Authz\Models\Permission;
use App\Shared\Authz\Models\Role;
use App\Shared\Authz\Models\TenantMembership;
use App\Shared\Tenancy\Models\Tenant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContractStatusTransitionTest extends TestCase
{
    use RefreshDatabase;

    public function test_contract_can_transition_through_valid_states(): void
    {
        $tenant = Tenant::query()->create([
            'name' => 'Johar Town',
            'slug' => 'johar-town',
            'database' => env('TENANT_DB_DATABASE', 'database/testing-tenant.sqlite'),
            'status' => 'active',
        ]);

        $role = Role::query()->create([
            'name' => 'Approver',
            'slug' => 'approver',
        ]);

        $permissions = collect(['contracts.view', 'contracts.create', 'contracts.update', 'contracts.approve'])
            ->map(fn (string $name) => Permission::query()->create(['name' => $name]));

        $role->permissions()->sync($permissions->pluck('id'));

        $user = User::factory()->create();

        TenantMembership::query()->create([
            'tenant_id' => $tenant->id,
            'user_id' => $user->id,
            'role_id' => $role->id,
            'status' => 'active',
        ]);

        $customer = Customer::query()->create([
            'name' => 'Contract Customer',
            'cnic' => '35202-8888888-8',
            'status' => 'active',
        ]);

        $contract = Contract::query()->create([
            'reference' => 'CTR-001',
            'customer_id' => $customer->id,
            'status' => 'Under Process',
            'cash_price' => 100000,
            'down_payment' => 20000,
            'financed_amount' => 80000,
            'tenure_months' => 12,
            'monthly_installment' => 7000,
            'product_snapshot' => ['name' => 'Bike'],
            'plan_snapshot' => ['plan' => 'Starter'],
        ]);

        Sanctum::actingAs($user);

        $this->withHeader('X-Tenant', 'johar-town')
            ->patchJson("/api/v1/app/contracts/{$contract->id}/status", [
                'status' => 'Under Verification',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', 'Under Verification');
    }
}

