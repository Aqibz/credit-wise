<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Modules\Accounts\Http\Requests\PostPurchaseReceiptLedgerRequest;
use App\Modules\Accounts\Resources\JournalEntryResource;
use App\Modules\Accounts\Services\PurchaseReceiptPostingService;
use App\Modules\Purchases\Models\PurchaseReceipt;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller;

class PurchaseReceiptLedgerPostingController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly PurchaseReceiptPostingService $postingService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function store(PostPurchaseReceiptLedgerRequest $request, PurchaseReceipt $purchaseReceipt): JournalEntryResource
    {
        $this->authorize('post', \App\Modules\Accounts\Models\JournalEntry::class);

        $entry = $this->postingService->handle($purchaseReceipt, $request->integer('debit_account_id'), $request->integer('credit_account_id'));
        $this->auditLogger->record('accounts.purchase_receipt.posted', $entry, ['purchase_receipt_id' => $purchaseReceipt->id, 'journal_entry_id' => $entry->id]);

        return JournalEntryResource::make($entry);
    }
}
