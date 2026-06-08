<?php

namespace App\Modules\Recovery\Http\Controllers;

use App\Modules\Recovery\Http\Requests\StoreRecoveryActionRequest;
use App\Modules\Recovery\Models\RecoveryCase;
use App\Modules\Recovery\Services\RecoveryActionService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class RecoveryActionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly RecoveryActionService $actionService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function store(StoreRecoveryActionRequest $request, RecoveryCase $recoveryCase): JsonResponse
    {
        $this->authorize('update', $recoveryCase);

        $action = $this->actionService->handle($recoveryCase, $request->validated());
        $this->auditLogger->record('recovery.action.created', $action, ['recovery_case_id' => $recoveryCase->id, 'recovery_action_id' => $action->id]);

        return response()->json([
            'data' => [
                'id' => $action->id,
                'recovery_case_id' => $action->recovery_case_id,
                'action_type' => $action->action_type,
                'outcome' => $action->outcome,
                'promised_amount' => $action->promised_amount,
                'promised_date' => $action->promised_date?->toDateString(),
                'notes' => $action->notes,
                'action_at' => $action->action_at?->toAtomString(),
            ],
        ], 201);
    }
}
