<?php

namespace App\Modules\Recovery\Services;

use App\Modules\Recovery\Models\RecoveryCase;
use Illuminate\Support\Facades\DB;

class RecoveryCaseUpsertService
{
    public function handle(array $payload, ?RecoveryCase $recoveryCase = null): RecoveryCase
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $recoveryCase): RecoveryCase {
            $recoveryCase ??= new RecoveryCase();
            $recoveryCase->fill($payload)->save();

            return $recoveryCase->refresh()->load('actions');
        });
    }
}
