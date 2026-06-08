<?php

namespace App\Modules\Receipts\Http\Controllers;

use App\Modules\Receipts\Http\Requests\StoreReceiptRequest;
use App\Modules\Receipts\Models\Receipt;
use App\Modules\Receipts\Queries\ReceiptIndexQuery;
use App\Modules\Receipts\Resources\ReceiptResource;
use App\Modules\Receipts\Services\ReceiptRecordingService;
use App\Shared\Audit\AuditLogger;
use App\Shared\Http\Pagination\ApiPagination;
use DomainException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;

class ReceiptController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly ReceiptIndexQuery $indexQuery,
        private readonly ReceiptRecordingService $recordingService,
        private readonly ApiPagination $pagination,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Receipt::class);

        $receipts = $this->indexQuery
            ->build($request)
            ->paginate($this->pagination->perPage($request));

        return response()->json([
            'data' => ReceiptResource::collection($receipts->items()),
            'meta' => [
                'filters' => $request->only(['contract_id', 'customer_id']),
                'pagination' => $this->pagination->meta($receipts),
            ],
        ]);
    }

    public function store(StoreReceiptRequest $request): JsonResponse
    {
        $this->authorize('create', Receipt::class);

        try {
            $receipt = $this->recordingService->handle($request->validated());
        } catch (DomainException $exception) {
            throw ValidationException::withMessages([
                'amount_received' => $exception->getMessage(),
            ]);
        }

        $this->auditLogger->record('receipt.recorded', $receipt, ['receipt_id' => $receipt->id]);

        return ReceiptResource::make($receipt)->response()->setStatusCode(201);
    }

    public function show(Receipt $receipt): ReceiptResource
    {
        $this->authorize('view', $receipt);

        return ReceiptResource::make($receipt->loadMissing('allocations:id,receipt_id,installment_id,allocated_amount'));
    }
}
