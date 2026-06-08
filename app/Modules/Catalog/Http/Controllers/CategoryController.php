<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Catalog\Http\Requests\UpsertCategoryRequest;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Resources\CategoryResource;
use App\Modules\Catalog\Services\CategoryUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly CategoryUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Category::class);

        $categories = Category::query()->orderBy('name')->paginate($request->integer('per_page', 15));

        return response()->json(['data' => CategoryResource::collection($categories->items()), 'meta' => ['pagination' => ['current_page' => $categories->currentPage(), 'last_page' => $categories->lastPage(), 'per_page' => $categories->perPage(), 'total' => $categories->total()]]]);
    }

    public function store(UpsertCategoryRequest $request): JsonResponse
    {
        $this->authorize('create', Category::class);
        $category = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('catalog.category.created', $category, ['category_id' => $category->id]);

        return CategoryResource::make($category)->response()->setStatusCode(201);
    }

    public function show(Category $category): CategoryResource
    {
        $this->authorize('view', $category);

        return CategoryResource::make($category);
    }

    public function update(UpsertCategoryRequest $request, Category $category): CategoryResource
    {
        $this->authorize('update', $category);
        $category = $this->upsertService->handle($request->validated(), $category);
        $this->auditLogger->record('catalog.category.updated', $category, ['category_id' => $category->id]);

        return CategoryResource::make($category);
    }

    public function destroy(Category $category): JsonResponse
    {
        $this->authorize('delete', $category);
        $category->delete();
        $this->auditLogger->record('catalog.category.deleted', $category, ['category_id' => $category->id]);

        return response()->json(status: 204);
    }
}
