<?php

namespace App\Modules\Tenant\Installments\Http\Controllers;

use App\Modules\Tenant\Contracts\Models\Contract;
use App\Modules\Tenant\Installments\Http\Requests\RegenerateInstallmentsRequest;
use App\Modules\Tenant\Installments\Services\InstallmentScheduleService;
use App\Shared\Audit\AuditLogger;
use DomainException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;

class ContractInstallmentScheduleController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly InstallmentScheduleService $scheduleService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function store(RegenerateInstallmentsRequest $request, Contract $contract): JsonResponse
    {
        $this->authorize('transition', $contract);

        try {
            // Schedule regeneration is transactional because partially posted installments must not be replaced mid-flow.
            $this->scheduleService->handle($contract, (bool) $request->boolean('force'));
        } catch (DomainException $exception) {
            throw ValidationException::withMessages([
                'force' => $exception->getMessage(),
            ]);
        }

        $this->auditLogger->record('installments.generated', $contract, ['contract_id' => $contract->id]);

        return response()->json([
            'message' => 'Installment schedule generated successfully.',
        ]);
    }
}

