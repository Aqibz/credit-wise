<?php

namespace Tests\Feature\Backend;

use App\Modules\Tenant\Contracts\Models\Contract;
use App\Modules\Tenant\Customers\Models\Customer;
use App\Modules\Tenant\Installments\Models\Installment;
use App\Modules\Tenant\Installments\Services\InstallmentScheduleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Backend\Concerns\CreatesTenantContext;
use Tests\TestCase;

class ReceiptDueTrackingFlowTest extends TestCase
{
    use CreatesTenantContext;
    use RefreshDatabase;

    public function test_receipt_allocation_updates_installments_and_due_tracking(): void
    {
        [, $user] = $this->createTenantUserWithPermissions([
            'payments.view',
            'payments.create',
            'installments.view',
        ]);

        $customer = Customer::query()->create([
            'name' => 'Ali Raza',
            'cnic' => '35202-2222222-2',
            'status' => 'active',
        ]);

        $contract = Contract::query()->create([
            'reference' => 'CTR-1002',
            'customer_id' => $customer->id,
            'status' => 'Approved',
            'cash_price' => 60000,
            'down_payment' => 10000,
            'financed_amount' => 50000,
            'tenure_months' => 3,
            'monthly_installment' => 16667,
            'product_snapshot' => ['name' => 'Phone'],
            'approved_at' => now(),
        ]);

        app(InstallmentScheduleService::class)->handle($contract);

        $firstInstallment = Installment::query()->where('contract_id', $contract->id)->where('sequence', 1)->firstOrFail();
        $secondInstallment = Installment::query()->where('contract_id', $contract->id)->where('sequence', 2)->firstOrFail();

        $firstInstallment->update(['due_date' => now()->subDay()->toDateString()]);
        $secondInstallment->update(['due_date' => now()->toDateString()]);

        Sanctum::actingAs($user);

        $receiptResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson('/api/v1/app/receipts', [
                'contract_id' => $contract->id,
                'receipt_date' => now()->toDateString(),
                'amount_received' => $firstInstallment->scheduled_amount,
                'payment_method' => 'cash',
                'allocations' => [
                    [
                        'installment_id' => $firstInstallment->id,
                        'allocated_amount' => $firstInstallment->scheduled_amount,
                    ],
                ],
            ]);

        $receiptResponse->assertCreated()->assertJsonPath('data.amount_received', $firstInstallment->scheduled_amount);

        $this->assertSame('paid', $firstInstallment->fresh()->status);

        $dueTrackingResponse = $this->withHeader('X-Tenant', 'model-town')
            ->getJson('/api/v1/app/due-tracking?window=today');

        $dueTrackingResponse
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $secondInstallment->id);
    }
}

