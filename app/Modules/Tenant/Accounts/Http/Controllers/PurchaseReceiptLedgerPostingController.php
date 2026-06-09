<?php

namespace App\Modules\Tenant\Accounts\Http\Controllers;

use App\Modules\Tenant\Accounts\Http\Requests\PostPurchaseReceiptLedgerRequest;
use App\Modules\Tenant\Accounts\Resources\JournalEntryResource;
use App\Modules\Tenant\Accounts\Services\PurchaseReceiptPostingService;
use App\Modules\Tenant\Purchases\Models\PurchaseReceipt;
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
        $this->authorize('post', \App\Modules\Tenant\Accounts\Models\JournalEntry::class);

        $entry = $this->postingService->handle($purchaseReceipt, $request->integer('debit_account_id'), $request->integer('credit_account_id'));
        $this->auditLogger->record('accounts.purchase_receipt.posted', $entry, ['purchase_receipt_id' => $purchaseReceipt->id, 'journal_entry_id' => $entry->id]);

        return JournalEntryResource::make($entry);
    }
}

