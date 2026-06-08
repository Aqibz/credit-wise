<?php

namespace App\Modules\Recovery\Services;

use App\Modules\Recovery\Events\RecoveryActionLogged;
use App\Modules\Recovery\Models\RecoveryAction;
use App\Modules\Recovery\Models\RecoveryCase;
use Illuminate\Support\Facades\DB;

class RecoveryActionService
{
    public function handle(RecoveryCase $recoveryCase, array $payload): RecoveryAction
    {
        return DB::connection('tenant')->transaction(function () use ($recoveryCase, $payload): RecoveryAction {
            $action = $recoveryCase->actions()->create($payload);

            $recoveryCase->last_contacted_at = $payload['action_at'];

            if (($payload['outcome'] ?? null) === 'resolved') {
                $recoveryCase->status = 'resolved';
                $recoveryCase->closed_at = now();
            }

            $recoveryCase->save();

            RecoveryActionLogged::dispatch($action);

            return $action->refresh();
        });
    }
}
