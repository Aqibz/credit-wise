<?php

namespace App\Modules\Tenant\Accounts\Services;

use App\Modules\Tenant\Purchases\Models\PurchaseReceipt;

class PurchaseReceiptPostingService
{
    public function __construct(
        private readonly JournalEntryService $journalEntryService,
    ) {
    }

    public function handle(PurchaseReceipt $purchaseReceipt, int $debitAccountId, int $creditAccountId): \App\Modules\Tenant\Accounts\Models\JournalEntry
    {
        $amount = $purchaseReceipt->items()->sum('line_total');

        return $this->journalEntryService->firstOrCreateSourceEntry(PurchaseReceipt::class, $purchaseReceipt->id, [
            'entry_date' => $purchaseReceipt->received_at?->toDateString() ?? now()->toDateString(),
            'source_type' => PurchaseReceipt::class,
            'source_id' => $purchaseReceipt->id,
            'description' => 'Purchase receipt posting '.$purchaseReceipt->reference,
            'lines' => [
                [
                    'account_id' => $debitAccountId,
                    'debit_amount' => $amount,
                    'credit_amount' => 0,
                    'memo' => 'Inventory received',
                ],
                [
                    'account_id' => $creditAccountId,
                    'debit_amount' => 0,
                    'credit_amount' => $amount,
                    'memo' => 'Supplier payable recognized',
                ],
            ],
            'meta' => ['purchase_receipt_id' => $purchaseReceipt->id, 'purchase_order_id' => $purchaseReceipt->purchase_order_id],
        ]);
    }
}

