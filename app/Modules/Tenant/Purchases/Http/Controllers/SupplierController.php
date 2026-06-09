<?php

namespace App\Modules\Tenant\Purchases\Http\Controllers;

use App\Modules\Tenant\Purchases\Http\Requests\UpsertSupplierRequest;
use App\Modules\Tenant\Purchases\Models\Supplier;
use App\Modules\Tenant\Purchases\Resources\SupplierResource;
use App\Modules\Tenant\Purchases\Services\SupplierUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SupplierController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly SupplierUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Supplier::class);

        $suppliers = Supplier::query()->orderBy('name')->paginate($request->integer('per_page', 15));

        return response()->json(['data' => SupplierResource::collection($suppliers->items()), 'meta' => ['pagination' => ['current_page' => $suppliers->currentPage(), 'last_page' => $suppliers->lastPage(), 'per_page' => $suppliers->perPage(), 'total' => $suppliers->total()]]]);
    }

    public function store(UpsertSupplierRequest $request): JsonResponse
    {
        $this->authorize('create', Supplier::class);
        $supplier = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('purchases.supplier.created', $supplier, ['supplier_id' => $supplier->id]);

        return SupplierResource::make($supplier)->response()->setStatusCode(201);
    }

    public function show(Supplier $supplier): SupplierResource
    {
        $this->authorize('view', $supplier);

        return SupplierResource::make($supplier);
    }

    public function update(UpsertSupplierRequest $request, Supplier $supplier): SupplierResource
    {
        $this->authorize('update', $supplier);
        $supplier = $this->upsertService->handle($request->validated(), $supplier);
        $this->auditLogger->record('purchases.supplier.updated', $supplier, ['supplier_id' => $supplier->id]);

        return SupplierResource::make($supplier);
    }
}

