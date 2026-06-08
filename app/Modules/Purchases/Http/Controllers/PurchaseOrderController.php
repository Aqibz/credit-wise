<?php

namespace App\Modules\Purchases\Http\Controllers;

use App\Modules\Purchases\Http\Requests\UpsertPurchaseOrderRequest;
use App\Modules\Purchases\Models\PurchaseOrder;
use App\Modules\Purchases\Queries\PurchaseOrderIndexQuery;
use App\Modules\Purchases\Resources\PurchaseOrderResource;
use App\Modules\Purchases\Services\PurchaseOrderUpsertService;
use App\Shared\Audit\AuditLogger;
use App\Shared\Http\Pagination\ApiPagination;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PurchaseOrderController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly PurchaseOrderIndexQuery $indexQuery,
        private readonly PurchaseOrderUpsertService $upsertService,
        private readonly ApiPagination $pagination,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', PurchaseOrder::class);

        $orders = $this->indexQuery
            ->build($request)
            ->paginate($this->pagination->perPage($request));

        return response()->json(['data' => PurchaseOrderResource::collection($orders->items()), 'meta' => ['filters' => $request->only(['status']), 'pagination' => $this->pagination->meta($orders)]]);
    }

    public function store(UpsertPurchaseOrderRequest $request): JsonResponse
    {
        $this->authorize('create', PurchaseOrder::class);
        $order = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('purchases.order.created', $order, ['purchase_order_id' => $order->id]);

        return PurchaseOrderResource::make($order)->response()->setStatusCode(201);
    }

    public function show(PurchaseOrder $purchaseOrder): PurchaseOrderResource
    {
        $this->authorize('view', $purchaseOrder);

        return PurchaseOrderResource::make($purchaseOrder->loadMissing('items:id,purchase_order_id,product_id,quantity_ordered,quantity_received,unit_cost,line_total'));
    }

    public function update(UpsertPurchaseOrderRequest $request, PurchaseOrder $purchaseOrder): PurchaseOrderResource
    {
        $this->authorize('update', $purchaseOrder);
        $purchaseOrder = $this->upsertService->handle($request->validated(), $purchaseOrder);
        $this->auditLogger->record('purchases.order.updated', $purchaseOrder, ['purchase_order_id' => $purchaseOrder->id]);

        return PurchaseOrderResource::make($purchaseOrder);
    }
}
