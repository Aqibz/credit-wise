<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Modules\Accounts\Http\Requests\PostReceiptLedgerRequest;
use App\Modules\Accounts\Resources\JournalEntryResource;
use App\Modules\Accounts\Services\ReceiptPostingService;
use App\Modules\Receipts\Models\Receipt;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller;

class ReceiptLedgerPostingController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly ReceiptPostingService $postingService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function store(PostReceiptLedgerRequest $request, Receipt $receipt): JournalEntryResource
    {
        $this->authorize('post', \App\Modules\Accounts\Models\JournalEntry::class);

        $entry = $this->postingService->handle($receipt, $request->integer('debit_account_id'), $request->integer('credit_account_id'));
        $this->auditLogger->record('accounts.receipt.posted', $entry, ['receipt_id' => $receipt->id, 'journal_entry_id' => $entry->id]);

        return JournalEntryResource::make($entry);
    }
}
