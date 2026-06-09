<?php

namespace App\Modules\Tenant\Inventory\Http\Controllers;

use App\Modules\Tenant\Inventory\Http\Requests\UpsertWarehouseRequest;
use App\Modules\Tenant\Inventory\Models\Warehouse;
use App\Modules\Tenant\Inventory\Resources\WarehouseResource;
use App\Modules\Tenant\Inventory\Services\WarehouseUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class WarehouseController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly WarehouseUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Warehouse::class);

        $warehouses = Warehouse::query()->orderBy('name')->paginate($request->integer('per_page', 15));

        return response()->json(['data' => WarehouseResource::collection($warehouses->items()), 'meta' => ['pagination' => ['current_page' => $warehouses->currentPage(), 'last_page' => $warehouses->lastPage(), 'per_page' => $warehouses->perPage(), 'total' => $warehouses->total()]]]);
    }

    public function store(UpsertWarehouseRequest $request): JsonResponse
    {
        $this->authorize('create', Warehouse::class);
        $warehouse = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('inventory.warehouse.created', $warehouse, ['warehouse_id' => $warehouse->id]);

        return WarehouseResource::make($warehouse)->response()->setStatusCode(201);
    }

    public function show(Warehouse $warehouse): WarehouseResource
    {
        $this->authorize('view', $warehouse);

        return WarehouseResource::make($warehouse);
    }

    public function update(UpsertWarehouseRequest $request, Warehouse $warehouse): WarehouseResource
    {
        $this->authorize('update', $warehouse);
        $warehouse = $this->upsertService->handle($request->validated(), $warehouse);
        $this->auditLogger->record('inventory.warehouse.updated', $warehouse, ['warehouse_id' => $warehouse->id]);

        return WarehouseResource::make($warehouse);
    }

    public function destroy(Warehouse $warehouse): JsonResponse
    {
        $this->authorize('delete', $warehouse);
        $warehouse->delete();
        $this->auditLogger->record('inventory.warehouse.deleted', $warehouse, ['warehouse_id' => $warehouse->id]);

        return response()->json(status: 204);
    }
}

