<?php

namespace App\Modules\Tenant\Contracts\Services;

use App\Modules\Tenant\Contracts\Events\ContractCreated;
use App\Modules\Tenant\Contracts\Models\Contract;
use Illuminate\Support\Facades\DB;

class ContractUpsertService
{
    public function handle(array $payload, ?Contract $contract = null): Contract
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $contract): Contract {
            $isNew = $contract === null;
            $contract ??= new Contract();

            $contract->fill($payload)->save();

            if ($isNew) {
                ContractCreated::dispatch($contract);
            }

            return $contract->load('customer');
        });
    }
}

