<?php

namespace App\Modules\Tenant\Purchases\Http\Controllers;

use App\Modules\Tenant\Purchases\Http\Requests\StorePurchaseReceiptRequest;
use App\Modules\Tenant\Purchases\Models\PurchaseOrder;
use App\Modules\Tenant\Purchases\Resources\PurchaseReceiptResource;
use App\Modules\Tenant\Purchases\Services\PurchaseReceiptService;
use App\Shared\Audit\AuditLogger;
use DomainException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;

class PurchaseOrderReceiptController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly PurchaseReceiptService $receiptService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function store(StorePurchaseReceiptRequest $request, PurchaseOrder $purchaseOrder): JsonResponse
    {
        $this->authorize('receive', $purchaseOrder);

        try {
            $receipt = $this->receiptService->handle($purchaseOrder, $request->validated());
        } catch (DomainException $exception) {
            throw ValidationException::withMessages([
                'items' => $exception->getMessage(),
            ]);
        }

        $this->auditLogger->record('purchases.receipt.created', $receipt, ['purchase_receipt_id' => $receipt->id]);

        return PurchaseReceiptResource::make($receipt)->response()->setStatusCode(201);
    }
}

