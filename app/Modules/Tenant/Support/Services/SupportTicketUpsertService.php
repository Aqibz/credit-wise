<?php

namespace App\Modules\Tenant\Support\Services;

use App\Modules\Tenant\Support\Models\SupportTicket;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SupportTicketUpsertService
{
    public function handle(array $payload, ?SupportTicket $ticket = null): SupportTicket
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $ticket): SupportTicket {
            $ticket ??= new SupportTicket();

            if (! $ticket->exists) {
                $payload['ticket_number'] ??= 'TKT-'.now()->format('YmdHis').'-'.Str::upper(Str::random(5));
            }

            if (($payload['status'] ?? null) === 'resolved' && empty($payload['resolved_at'])) {
                $payload['resolved_at'] = now();
            }

            $ticket->fill($payload)->save();

            return $ticket->refresh()->load('messages');
        });
    }
}

