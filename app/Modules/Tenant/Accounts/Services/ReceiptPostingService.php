<?php

namespace App\Modules\Tenant\Accounts\Services;

use App\Modules\Tenant\Receipts\Models\Receipt;

class ReceiptPostingService
{
    public function __construct(
        private readonly JournalEntryService $journalEntryService,
    ) {
    }

    public function handle(Receipt $receipt, int $debitAccountId, int $creditAccountId): \App\Modules\Tenant\Accounts\Models\JournalEntry
    {
        return $this->journalEntryService->firstOrCreateSourceEntry(Receipt::class, $receipt->id, [
            'entry_date' => $receipt->receipt_date?->toDateString() ?? now()->toDateString(),
            'source_type' => Receipt::class,
            'source_id' => $receipt->id,
            'description' => 'Receipt posting '.$receipt->receipt_number,
            'lines' => [
                [
                    'account_id' => $debitAccountId,
                    'debit_amount' => $receipt->amount_received,
                    'credit_amount' => 0,
                    'memo' => 'Cash or bank received',
                ],
                [
                    'account_id' => $creditAccountId,
                    'debit_amount' => 0,
                    'credit_amount' => $receipt->amount_received,
                    'memo' => 'Customer receivable settled',
                ],
            ],
            'meta' => ['receipt_id' => $receipt->id, 'contract_id' => $receipt->contract_id],
        ]);
    }
}

