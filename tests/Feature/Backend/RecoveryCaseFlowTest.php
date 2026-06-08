<?php

namespace Tests\Feature\Backend;

use App\Modules\Contracts\Models\Contract;
use App\Modules\Customers\Models\Customer;
use App\Modules\Installments\Models\Installment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Backend\Concerns\CreatesTenantContext;
use Tests\TestCase;

class RecoveryCaseFlowTest extends TestCase
{
    use CreatesTenantContext;
    use RefreshDatabase;

    public function test_recovery_case_and_action_can_be_logged(): void
    {
        [, $user] = $this->createTenantUserWithPermissions([
            'recovery.view',
            'recovery.manage',
        ]);

        $customer = Customer::query()->create([
            'name' => 'Ali Raza',
            'cnic' => '35202-3333333-3',
            'status' => 'active',
        ]);

        $contract = Contract::query()->create([
            'reference' => 'CTR-1003',
            'customer_id' => $customer->id,
            'status' => 'Approved',
            'cash_price' => 50000,
            'down_payment' => 10000,
            'financed_amount' => 40000,
            'tenure_months' => 2,
            'monthly_installment' => 20000,
            'product_snapshot' => ['name' => 'AC'],
        ]);

        $installment = Installment::query()->create([
            'contract_id' => $contract->id,
            'sequence' => 1,
            'due_date' => now()->subDays(10)->toDateString(),
            'scheduled_amount' => 20000,
            'principal_amount' => 20000,
            'paid_amount' => 0,
            'outstanding_amount' => 20000,
            'status' => 'overdue',
        ]);

        Sanctum::actingAs($user);

        $caseResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson('/api/v1/app/recovery-cases', [
                'contract_id' => $contract->id,
                'installment_id' => $installment->id,
                'assigned_user_id' => $user->id,
                'status' => 'open',
                'opened_at' => now()->toAtomString(),
            ]);

        $caseResponse->assertCreated();
        $caseId = $caseResponse->json('data.id');

        $actionResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson("/api/v1/app/recovery-cases/{$caseId}/actions", [
                'created_by_user_id' => $user->id,
                'action_type' => 'promise',
                'outcome' => 'resolved',
                'promised_amount' => 20000,
                'promised_date' => now()->addDay()->toDateString(),
                'action_at' => now()->toAtomString(),
            ]);

        $actionResponse->assertCreated()->assertJsonPath('data.outcome', 'resolved');
        $this->assertSame('resolved', \App\Modules\Recovery\Models\RecoveryCase::query()->findOrFail($caseId)->status);
    }
}
