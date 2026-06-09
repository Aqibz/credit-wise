<?php

namespace App\Modules\Tenant\Recovery\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RecoveryCaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'contract_id' => $this->contract_id,
            'installment_id' => $this->installment_id,
            'assigned_user_id' => $this->assigned_user_id,
            'status' => $this->status,
            'opened_at' => $this->opened_at?->toAtomString(),
            'last_contacted_at' => $this->last_contacted_at?->toAtomString(),
            'closed_at' => $this->closed_at?->toAtomString(),
            'meta' => $this->meta ?? [],
            'actions' => $this->whenLoaded('actions', fn () => $this->actions->map(fn ($action) => [
                'id' => $action->id,
                'action_type' => $action->action_type,
                'outcome' => $action->outcome,
                'promised_amount' => $action->promised_amount,
                'promised_date' => $action->promised_date?->toDateString(),
                'notes' => $action->notes,
                'action_at' => $action->action_at?->toAtomString(),
            ])->values()),
        ];
    }
}

