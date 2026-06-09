<?php

namespace Tests\Feature\Backend;

use App\Modules\Tenant\Contracts\Models\Contract;
use App\Modules\Tenant\Customers\Models\Customer;
use App\Modules\Tenant\Installments\Models\Installment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Backend\Concerns\CreatesTenantContext;
use Tests\TestCase;

class InstallmentScheduleGenerationTest extends TestCase
{
    use CreatesTenantContext;
    use RefreshDatabase;

    public function test_contract_approval_generates_installment_schedule(): void
    {
        [, $user] = $this->createTenantUserWithPermissions([
            'contracts.view',
            'contracts.approve',
            'installments.view',
        ]);

        $customer = Customer::query()->create([
            'name' => 'Ali Raza',
            'cnic' => '35202-1111111-1',
            'status' => 'active',
        ]);

        $contract = Contract::query()->create([
            'reference' => 'CTR-1001',
            'customer_id' => $customer->id,
            'status' => 'Under Approval',
            'cash_price' => 120000,
            'down_payment' => 20000,
            'financed_amount' => 100000,
            'tenure_months' => 5,
            'monthly_installment' => 20000,
            'product_snapshot' => ['name' => 'Bike'],
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Tenant', 'model-town')
            ->patchJson("/api/v1/app/contracts/{$contract->id}/status", [
                'status' => 'Approved',
            ]);

        $response->assertOk()->assertJsonPath('data.status', 'Approved');

        $this->assertDatabaseCount('installments', 5, 'tenant');
        $this->assertSame(5, Installment::query()->where('contract_id', $contract->id)->count());
    }
}

