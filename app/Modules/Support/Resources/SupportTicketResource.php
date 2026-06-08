<?php

namespace App\Modules\Support\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SupportTicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'contract_id' => $this->contract_id,
            'created_by_user_id' => $this->created_by_user_id,
            'assigned_user_id' => $this->assigned_user_id,
            'ticket_number' => $this->ticket_number,
            'subject' => $this->subject,
            'channel' => $this->channel,
            'priority' => $this->priority,
            'status' => $this->status,
            'description' => $this->description,
            'resolved_at' => $this->resolved_at?->toAtomString(),
            'meta' => $this->meta ?? [],
            'messages_count' => $this->whenCounted('messages'),
            'messages' => $this->whenLoaded('messages', fn () => $this->messages->map(fn ($message) => [
                'id' => $message->id,
                'created_by_user_id' => $message->created_by_user_id,
                'message_type' => $message->message_type,
                'message' => $message->message,
                'created_at' => $message->created_at?->toAtomString(),
            ])->values()),
        ];
    }
}
