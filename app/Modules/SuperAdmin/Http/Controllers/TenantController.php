<?php

namespace App\Modules\SuperAdmin\Http\Controllers;

use App\Modules\SuperAdmin\Http\Requests\UpsertTenantRequest;
use App\Modules\SuperAdmin\Resources\TenantResource;
use App\Modules\SuperAdmin\Services\TenantUpsertService;
use App\Shared\Tenancy\Models\Tenant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class TenantController extends Controller
{
    public function __construct(
        private readonly TenantUpsertService $upsertService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->is_super_admin, 403);

        $tenants = Tenant::query()->with('activeDomain')->latest()->paginate(15);

        return response()->json([
            'data' => TenantResource::collection($tenants->items()),
            'meta' => [
                'pagination' => [
                    'current_page' => $tenants->currentPage(),
                    'last_page' => $tenants->lastPage(),
                    'per_page' => $tenants->perPage(),
                    'total' => $tenants->total(),
                ],
            ],
        ]);
    }

    public function store(UpsertTenantRequest $request): JsonResponse
    {
        return TenantResource::make(
            $this->upsertService->handle($request->validated()),
        )->response()->setStatusCode(201);
    }

    public function show(Request $request, Tenant $tenant): TenantResource
    {
        abort_unless($request->user()?->is_super_admin, 403);

        return TenantResource::make($tenant->load('activeDomain'));
    }

    public function update(UpsertTenantRequest $request, Tenant $tenant): TenantResource
    {
        return TenantResource::make(
            $this->upsertService->handle($request->validated(), $tenant),
        );
    }

    public function destroy(Request $request, Tenant $tenant): JsonResponse
    {
        abort_unless($request->user()?->is_super_admin, 403);

        $tenant->delete();

        return response()->json(status: 204);
    }
}
