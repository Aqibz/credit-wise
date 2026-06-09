<?php

namespace App\Modules\Tenant\Inventory\Http\Controllers;

use App\Modules\Tenant\Inventory\Http\Requests\StoreStockMovementRequest;
use App\Modules\Tenant\Inventory\Models\StockMovement;
use App\Modules\Tenant\Inventory\Resources\StockMovementResource;
use App\Modules\Tenant\Inventory\Services\StockMovementService;
use App\Shared\Audit\AuditLogger;
use DomainException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;

class StockMovementController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly StockMovementService $stockMovementService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', StockMovement::class);

        $movements = StockMovement::query()
            ->when($request->integer('warehouse_id'), fn ($query, int $warehouseId) => $query->where('warehouse_id', $warehouseId))
            ->when($request->integer('product_id'), fn ($query, int $productId) => $query->where('product_id', $productId))
            ->orderByDesc('occurred_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json(['data' => StockMovementResource::collection($movements->items()), 'meta' => ['filters' => $request->only(['warehouse_id', 'product_id']), 'pagination' => ['current_page' => $movements->currentPage(), 'last_page' => $movements->lastPage(), 'per_page' => $movements->perPage(), 'total' => $movements->total()]]]);
    }

    public function store(StoreStockMovementRequest $request): JsonResponse
    {
        $this->authorize('create', StockMovement::class);

        try {
            $movement = $this->stockMovementService->handle($request->validated());
        } catch (DomainException $exception) {
            throw ValidationException::withMessages([
                'quantity' => $exception->getMessage(),
            ]);
        }

        $this->auditLogger->record('inventory.stock_movement.recorded', $movement, ['stock_movement_id' => $movement->id]);

        return StockMovementResource::make($movement)->response()->setStatusCode(201);
    }
}

