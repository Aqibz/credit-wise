<?php

namespace App\Modules\Catalog\Http\Controllers;

use App\Modules\Catalog\Http\Requests\UpsertPricingPlanRequest;
use App\Modules\Catalog\Models\PricingPlan;
use App\Modules\Catalog\Resources\PricingPlanResource;
use App\Modules\Catalog\Services\PricingPlanUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PricingPlanController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly PricingPlanUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', PricingPlan::class);

        $pricingPlans = PricingPlan::query()
            ->when($request->integer('product_id'), fn ($query, int $productId) => $query->where('product_id', $productId))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15));

        return response()->json(['data' => PricingPlanResource::collection($pricingPlans->items()), 'meta' => ['filters' => $request->only(['product_id']), 'pagination' => ['current_page' => $pricingPlans->currentPage(), 'last_page' => $pricingPlans->lastPage(), 'per_page' => $pricingPlans->perPage(), 'total' => $pricingPlans->total()]]]);
    }

    public function store(UpsertPricingPlanRequest $request): JsonResponse
    {
        $this->authorize('create', PricingPlan::class);
        $pricingPlan = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('catalog.pricing_plan.created', $pricingPlan, ['pricing_plan_id' => $pricingPlan->id]);

        return PricingPlanResource::make($pricingPlan)->response()->setStatusCode(201);
    }

    public function show(PricingPlan $pricingPlan): PricingPlanResource
    {
        $this->authorize('view', $pricingPlan);

        return PricingPlanResource::make($pricingPlan);
    }

    public function update(UpsertPricingPlanRequest $request, PricingPlan $pricingPlan): PricingPlanResource
    {
        $this->authorize('update', $pricingPlan);
        $pricingPlan = $this->upsertService->handle($request->validated(), $pricingPlan);
        $this->auditLogger->record('catalog.pricing_plan.updated', $pricingPlan, ['pricing_plan_id' => $pricingPlan->id]);

        return PricingPlanResource::make($pricingPlan);
    }

    public function destroy(PricingPlan $pricingPlan): JsonResponse
    {
        $this->authorize('delete', $pricingPlan);
        $pricingPlan->delete();
        $this->auditLogger->record('catalog.pricing_plan.deleted', $pricingPlan, ['pricing_plan_id' => $pricingPlan->id]);

        return response()->json(status: 204);
    }
}
