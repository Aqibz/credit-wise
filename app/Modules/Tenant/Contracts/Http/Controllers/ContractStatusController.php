<?php

namespace App\Modules\Tenant\Contracts\Http\Controllers;

use App\Modules\Tenant\Contracts\Enums\ContractStatus;
use App\Modules\Tenant\Contracts\Http\Requests\UpdateContractStatusRequest;
use App\Modules\Tenant\Contracts\Models\Contract;
use App\Modules\Tenant\Contracts\Resources\ContractResource;
use App\Modules\Tenant\Contracts\Services\ContractStatusService;
use App\Shared\Audit\AuditLogger;
use DomainException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;

class ContractStatusController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly ContractStatusService $statusService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function __invoke(UpdateContractStatusRequest $request, string $contract): ContractResource
    {
        $contract = Contract::query()->findOrFail($contract);
        $this->authorize('transition', $contract);

        try {
            $updated = $this->statusService->handle($contract, ContractStatus::from($request->string('status')->value()));
        } catch (DomainException $exception) {
            throw ValidationException::withMessages([
                'status' => $exception->getMessage(),
            ]);
        }

        $this->auditLogger->record('contract.status_changed', $updated, ['status' => $updated->status]);

        return ContractResource::make($updated);
    }
}

