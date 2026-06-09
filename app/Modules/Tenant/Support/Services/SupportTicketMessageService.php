<?php

namespace App\Modules\Tenant\Support\Services;

use App\Modules\Tenant\Support\Models\SupportTicket;
use App\Modules\Tenant\Support\Models\SupportTicketMessage;
use Illuminate\Support\Facades\DB;

class SupportTicketMessageService
{
    public function handle(SupportTicket $ticket, array $payload): SupportTicketMessage
    {
        return DB::connection('tenant')->transaction(function () use ($ticket, $payload): SupportTicketMessage {
            $message = $ticket->messages()->create($payload);

            if ($ticket->status === 'resolved' && ($payload['message_type'] ?? null) !== 'resolution') {
                $ticket->status = 'in_progress';
                $ticket->resolved_at = null;
                $ticket->save();
            }

            return $message->refresh();
        });
    }
}

