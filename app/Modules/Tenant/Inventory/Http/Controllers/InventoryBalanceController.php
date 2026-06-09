<?php

namespace App\Modules\Tenant\Inventory\Http\Controllers;

use App\Modules\Tenant\Inventory\Models\InventoryBalance;
use App\Modules\Tenant\Inventory\Resources\InventoryBalanceResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class InventoryBalanceController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', InventoryBalance::class);

        $balances = InventoryBalance::query()
            ->with('product')
            ->when($request->integer('warehouse_id'), fn ($query, int $warehouseId) => $query->where('warehouse_id', $warehouseId))
            ->when($request->integer('product_id'), fn ($query, int $productId) => $query->where('product_id', $productId))
            ->orderBy('warehouse_id')
            ->orderBy('product_id')
            ->paginate($request->integer('per_page', 15));

        return response()->json(['data' => InventoryBalanceResource::collection($balances->items()), 'meta' => ['filters' => $request->only(['warehouse_id', 'product_id']), 'pagination' => ['current_page' => $balances->currentPage(), 'last_page' => $balances->lastPage(), 'per_page' => $balances->perPage(), 'total' => $balances->total()]]]);
    }
}

