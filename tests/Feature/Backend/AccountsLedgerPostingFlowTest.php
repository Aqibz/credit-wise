<?php

namespace Tests\Feature\Backend;

use App\Modules\Tenant\Accounts\Models\Account;
use App\Modules\Tenant\Contracts\Models\Contract;
use App\Modules\Tenant\Customers\Models\Customer;
use App\Modules\Tenant\Installments\Services\InstallmentScheduleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Backend\Concerns\CreatesTenantContext;
use Tests\TestCase;

class AccountsLedgerPostingFlowTest extends TestCase
{
    use CreatesTenantContext;
    use RefreshDatabase;

    public function test_receipt_can_be_posted_to_ledger_once(): void
    {
        [, $user] = $this->createTenantUserWithPermissions([
            'payments.create',
            'accounts.view',
            'accounts.manage',
            'accounts.post',
        ]);

        $cashAccount = Account::query()->create([
            'code' => '1000',
            'name' => 'Cash',
            'type' => 'asset',
            'nature' => 'debit',
        ]);

        $receivableAccount = Account::query()->create([
            'code' => '1100',
            'name' => 'Customer Receivable',
            'type' => 'asset',
            'nature' => 'debit',
        ]);

        $customer = Customer::query()->create([
            'name' => 'Ali Raza',
            'cnic' => '35202-4444444-4',
            'status' => 'active',
        ]);

        $contract = Contract::query()->create([
            'reference' => 'CTR-2001',
            'customer_id' => $customer->id,
            'status' => 'Approved',
            'cash_price' => 100000,
            'down_payment' => 20000,
            'financed_amount' => 80000,
            'tenure_months' => 4,
            'monthly_installment' => 20000,
            'product_snapshot' => ['name' => 'Bike'],
            'approved_at' => now(),
        ]);

        app(InstallmentScheduleService::class)->handle($contract);

        Sanctum::actingAs($user);

        $receiptResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson('/api/v1/app/receipts', [
                'contract_id' => $contract->id,
                'receipt_date' => now()->toDateString(),
                'amount_received' => 20000,
                'payment_method' => 'cash',
            ]);

        $receiptResponse->assertCreated();
        $receiptId = $receiptResponse->json('data.id');

        $postResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson("/api/v1/app/receipts/{$receiptId}/post-ledger", [
                'debit_account_id' => $cashAccount->id,
                'credit_account_id' => $receivableAccount->id,
            ]);

        $postResponse
            ->assertCreated()
            ->assertJsonPath('data.total_debit', 20000)
            ->assertJsonPath('data.total_credit', 20000);

        $duplicatePostResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson("/api/v1/app/receipts/{$receiptId}/post-ledger", [
                'debit_account_id' => $cashAccount->id,
                'credit_account_id' => $receivableAccount->id,
            ]);

        $duplicatePostResponse->assertOk();
        $this->assertDatabaseCount('journal_entries', 1, 'tenant');
    }
}

