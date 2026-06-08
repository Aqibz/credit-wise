<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Catalog\Http\Requests\UpsertProductRequest;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Resources\ProductResource;
use App\Modules\Catalog\Services\ProductUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ProductController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly ProductUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Product::class);

        $products = Product::query()
            ->with(['brand', 'category', 'pricingPlans'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return response()->json(['data' => ProductResource::collection($products->items()), 'meta' => ['filters' => $request->only(['status']), 'pagination' => ['current_page' => $products->currentPage(), 'last_page' => $products->lastPage(), 'per_page' => $products->perPage(), 'total' => $products->total()]]]);
    }

    public function store(UpsertProductRequest $request): JsonResponse
    {
        $this->authorize('create', Product::class);
        $product = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('catalog.product.created', $product, ['product_id' => $product->id]);

        return ProductResource::make($product)->response()->setStatusCode(201);
    }

    public function show(Product $product): ProductResource
    {
        $this->authorize('view', $product);

        return ProductResource::make($product->load(['brand', 'category', 'pricingPlans']));
    }

    public function update(UpsertProductRequest $request, Product $product): ProductResource
    {
        $this->authorize('update', $product);
        $product = $this->upsertService->handle($request->validated(), $product);
        $this->auditLogger->record('catalog.product.updated', $product, ['product_id' => $product->id]);

        return ProductResource::make($product);
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->authorize('delete', $product);
        $product->delete();
        $this->auditLogger->record('catalog.product.deleted', $product, ['product_id' => $product->id]);

        return response()->json(status: 204);
    }
}
