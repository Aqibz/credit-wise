<?php

namespace App\Modules\Tenant\Contracts\Services;

use App\Modules\Tenant\Contracts\Enums\ContractStatus;
use App\Modules\Tenant\Contracts\Events\ContractStatusChanged;
use App\Modules\Tenant\Contracts\Models\Contract;
use App\Modules\Tenant\Installments\Services\InstallmentScheduleService;
use DomainException;
use Illuminate\Support\Facades\DB;

class ContractStatusService
{
    public function __construct(
        private readonly InstallmentScheduleService $installmentScheduleService,
    ) {
    }

    public function handle(Contract $contract, ContractStatus $targetStatus): Contract
    {
        return DB::connection('tenant')->transaction(function () use ($contract, $targetStatus): Contract {
            $currentStatus = ContractStatus::from($contract->status);

            if (! $currentStatus->canTransitionTo($targetStatus)) {
                throw new DomainException("Cannot transition contract from {$currentStatus->value} to {$targetStatus->value}.");
            }

            $contract->status = $targetStatus->value;

            if ($targetStatus === ContractStatus::Approved) {
                $contract->approved_at = now();
            }

            if ($targetStatus === ContractStatus::Closed) {
                $contract->closed_at = now();
            }

            $contract->save();

            if ($targetStatus === ContractStatus::Approved) {
                $this->installmentScheduleService->handle($contract);
            }

            ContractStatusChanged::dispatch($contract, $currentStatus->value, $targetStatus->value);

            return $contract->refresh()->load('customer');
        });
    }
}

