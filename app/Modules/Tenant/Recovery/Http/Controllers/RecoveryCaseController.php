<?php

namespace App\Modules\Tenant\Recovery\Http\Controllers;

use App\Modules\Tenant\Recovery\Http\Requests\UpsertRecoveryCaseRequest;
use App\Modules\Tenant\Recovery\Models\RecoveryCase;
use App\Modules\Tenant\Recovery\Resources\RecoveryCaseResource;
use App\Modules\Tenant\Recovery\Services\RecoveryCaseUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class RecoveryCaseController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly RecoveryCaseUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', RecoveryCase::class);

        $cases = RecoveryCase::query()
            ->with('actions')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->integer('contract_id'), fn ($query, int $contractId) => $query->where('contract_id', $contractId))
            ->orderByDesc('opened_at')
            ->paginate($request->integer('per_page', 15));

        return response()->json(['data' => RecoveryCaseResource::collection($cases->items()), 'meta' => ['filters' => $request->only(['status', 'contract_id']), 'pagination' => ['current_page' => $cases->currentPage(), 'last_page' => $cases->lastPage(), 'per_page' => $cases->perPage(), 'total' => $cases->total()]]]);
    }

    public function store(UpsertRecoveryCaseRequest $request): JsonResponse
    {
        $this->authorize('create', RecoveryCase::class);

        $recoveryCase = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('recovery.case.created', $recoveryCase, ['recovery_case_id' => $recoveryCase->id]);

        return RecoveryCaseResource::make($recoveryCase)->response()->setStatusCode(201);
    }

    public function show(RecoveryCase $recoveryCase): RecoveryCaseResource
    {
        $this->authorize('view', $recoveryCase);

        return RecoveryCaseResource::make($recoveryCase->load('actions'));
    }

    public function update(UpsertRecoveryCaseRequest $request, RecoveryCase $recoveryCase): RecoveryCaseResource
    {
        $this->authorize('update', $recoveryCase);

        $recoveryCase = $this->upsertService->handle($request->validated(), $recoveryCase);
        $this->auditLogger->record('recovery.case.updated', $recoveryCase, ['recovery_case_id' => $recoveryCase->id]);

        return RecoveryCaseResource::make($recoveryCase);
    }
}

