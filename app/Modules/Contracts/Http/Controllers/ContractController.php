<?php

namespace App\Modules\Contracts\Http\Controllers;

use App\Modules\Contracts\Http\Requests\UpsertContractRequest;
use App\Modules\Contracts\Models\Contract;
use App\Modules\Contracts\Queries\ContractIndexQuery;
use App\Modules\Contracts\Resources\ContractResource;
use App\Modules\Contracts\Services\ContractUpsertService;
use App\Shared\Http\Pagination\ApiPagination;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ContractController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly ContractIndexQuery $indexQuery,
        private readonly ContractUpsertService $upsertService,
        private readonly ApiPagination $pagination,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Contract::class);

        $contracts = $this->indexQuery
            ->build($request)
            ->paginate($this->pagination->perPage($request));

        return response()->json([
            'data' => ContractResource::collection($contracts->items()),
            'meta' => [
                'filters' => $request->only(['q', 'status']),
                'pagination' => $this->pagination->meta($contracts),
            ],
        ]);
    }

    public function store(UpsertContractRequest $request): JsonResponse
    {
        $this->authorize('create', Contract::class);

        $contract = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('contract.created', $contract, ['reference' => $contract->reference]);

        return ContractResource::make($contract)->response()->setStatusCode(201);
    }

    public function show(Contract $contract): ContractResource
    {
        $this->authorize('view', $contract);

        return ContractResource::make($contract->loadMissing('customer:id,name,cnic'));
    }

    public function update(UpsertContractRequest $request, Contract $contract): ContractResource
    {
        $this->authorize('update', $contract);

        $contract = $this->upsertService->handle($request->validated(), $contract);
        $this->auditLogger->record('contract.updated', $contract, ['reference' => $contract->reference]);

        return ContractResource::make($contract);
    }

    public function destroy(Contract $contract): JsonResponse
    {
        $this->authorize('update', $contract);

        $contract->delete();
        $this->auditLogger->record('contract.deleted', $contract, ['reference' => $contract->reference]);

        return response()->json(status: 204);
    }
}
