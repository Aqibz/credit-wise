<?php

namespace App\Modules\Tenant\Support\Queries;

use App\Modules\Tenant\Support\Models\SupportTicket;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class SupportTicketIndexQuery
{
    public function build(Request $request): Builder
    {
        return SupportTicket::query()
            ->select([
                'id',
                'customer_id',
                'contract_id',
                'created_by_user_id',
                'assigned_user_id',
                'ticket_number',
                'subject',
                'channel',
                'priority',
                'status',
                'description',
                'resolved_at',
                'meta',
                'created_at',
                'updated_at',
            ])
            // Ticket conversations can grow large, so list views should not preload full message bodies.
            ->withCount('messages')
            ->when(
                $request->filled('status'),
                fn (Builder $query) => $query->where('status', $request->string('status')->toString()),
            )
            ->when(
                $request->filled('priority'),
                fn (Builder $query) => $query->where('priority', $request->string('priority')->toString()),
            )
            ->when(
                $request->filled('q'),
                fn (Builder $query) => $query->where(function (Builder $inner) use ($request): void {
                    $search = $request->string('q')->toString();

                    // Keep the search predicate grouped so status/priority filters remain tenant-safe and predictable.
                    $inner->where('ticket_number', 'like', "%{$search}%")
                        ->orWhere('subject', 'like', "%{$search}%");
                }),
            )
            ->orderByDesc('id');
    }
}

