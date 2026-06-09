<?php

namespace App\Modules\Tenant\Catalog\Http\Controllers;

use App\Modules\Tenant\Catalog\Http\Requests\UpsertBrandRequest;
use App\Modules\Tenant\Catalog\Models\Brand;
use App\Modules\Tenant\Catalog\Resources\BrandResource;
use App\Modules\Tenant\Catalog\Services\BrandUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class BrandController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly BrandUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Brand::class);

        $brands = Brand::query()->orderBy('name')->paginate($request->integer('per_page', 15));

        return response()->json(['data' => BrandResource::collection($brands->items()), 'meta' => ['pagination' => ['current_page' => $brands->currentPage(), 'last_page' => $brands->lastPage(), 'per_page' => $brands->perPage(), 'total' => $brands->total()]]]);
    }

    public function store(UpsertBrandRequest $request): JsonResponse
    {
        $this->authorize('create', Brand::class);
        $brand = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('catalog.brand.created', $brand, ['brand_id' => $brand->id]);

        return BrandResource::make($brand)->response()->setStatusCode(201);
    }

    public function show(Brand $brand): BrandResource
    {
        $this->authorize('view', $brand);

        return BrandResource::make($brand);
    }

    public function update(UpsertBrandRequest $request, Brand $brand): BrandResource
    {
        $this->authorize('update', $brand);
        $brand = $this->upsertService->handle($request->validated(), $brand);
        $this->auditLogger->record('catalog.brand.updated', $brand, ['brand_id' => $brand->id]);

        return BrandResource::make($brand);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $this->authorize('delete', $brand);
        $brand->delete();
        $this->auditLogger->record('catalog.brand.deleted', $brand, ['brand_id' => $brand->id]);

        return response()->json(status: 204);
    }
}

