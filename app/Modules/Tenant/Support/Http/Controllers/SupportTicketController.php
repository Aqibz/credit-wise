<?php

namespace App\Modules\Tenant\Support\Http\Controllers;

use App\Modules\Tenant\Support\Http\Requests\UpsertSupportTicketRequest;
use App\Modules\Tenant\Support\Models\SupportTicket;
use App\Modules\Tenant\Support\Queries\SupportTicketIndexQuery;
use App\Modules\Tenant\Support\Resources\SupportTicketResource;
use App\Modules\Tenant\Support\Services\SupportTicketUpsertService;
use App\Shared\Audit\AuditLogger;
use App\Shared\Http\Pagination\ApiPagination;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SupportTicketController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly SupportTicketIndexQuery $indexQuery,
        private readonly SupportTicketUpsertService $upsertService,
        private readonly ApiPagination $pagination,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', SupportTicket::class);

        $tickets = $this->indexQuery
            ->build($request)
            ->paginate($this->pagination->perPage($request));

        return response()->json(['data' => SupportTicketResource::collection($tickets->items()), 'meta' => ['filters' => $request->only(['q', 'status', 'priority']), 'pagination' => $this->pagination->meta($tickets)]]);
    }

    public function store(UpsertSupportTicketRequest $request): JsonResponse
    {
        $this->authorize('create', SupportTicket::class);
        $ticket = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('support.ticket.created', $ticket, ['support_ticket_id' => $ticket->id]);

        return SupportTicketResource::make($ticket)->response()->setStatusCode(201);
    }

    public function show(SupportTicket $supportTicket): SupportTicketResource
    {
        $this->authorize('view', $supportTicket);

        return SupportTicketResource::make($supportTicket->loadMissing('messages:id,support_ticket_id,created_by_user_id,message_type,message,created_at'));
    }

    public function update(UpsertSupportTicketRequest $request, SupportTicket $supportTicket): SupportTicketResource
    {
        $this->authorize('update', $supportTicket);
        $supportTicket = $this->upsertService->handle($request->validated(), $supportTicket);
        $this->auditLogger->record('support.ticket.updated', $supportTicket, ['support_ticket_id' => $supportTicket->id]);

        return SupportTicketResource::make($supportTicket);
    }
}

