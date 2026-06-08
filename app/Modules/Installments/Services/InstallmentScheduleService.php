<?php

namespace App\Modules\Installments\Services;

use App\Modules\Contracts\Models\Contract;
use App\Modules\Installments\Events\InstallmentScheduleGenerated;
use App\Modules\Installments\Models\Installment;
use Carbon\CarbonImmutable;
use DomainException;
use Illuminate\Support\Facades\DB;

class InstallmentScheduleService
{
    public function handle(Contract $contract, bool $force = false): void
    {
        DB::connection('tenant')->transaction(function () use ($contract, $force): void {
            $existingInstallments = $contract->installments()->lockForUpdate()->get();

            if ($existingInstallments->isNotEmpty() && ! $force) {
                return;
            }

            if ($force && $existingInstallments->contains(fn (Installment $installment) => $installment->paid_amount > 0)) {
                throw new DomainException('Cannot regenerate an installment schedule after receipts have been allocated.');
            }

            $contract->installments()->delete();

            $approvedAt = CarbonImmutable::instance($contract->approved_at ?? now());
            $monthlyAmount = (int) $contract->monthly_installment;
            $installments = [];

            for ($sequence = 1; $sequence <= $contract->tenure_months; $sequence++) {
                $dueDate = $approvedAt->addMonthsNoOverflow($sequence)->toDateString();

                $installments[] = [
                    'contract_id' => $contract->id,
                    'sequence' => $sequence,
                    'due_date' => $dueDate,
                    'scheduled_amount' => $monthlyAmount,
                    'principal_amount' => $monthlyAmount,
                    'paid_amount' => 0,
                    'outstanding_amount' => $monthlyAmount,
                    'status' => 'pending',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            Installment::query()->insert($installments);

            InstallmentScheduleGenerated::dispatch($contract->refresh(), count($installments));
        });
    }
}
