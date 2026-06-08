<?php

namespace App\Modules\Support\Http\Controllers;

use App\Modules\Support\Http\Requests\StoreSupportTicketMessageRequest;
use App\Modules\Support\Models\SupportTicket;
use App\Modules\Support\Services\SupportTicketMessageService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;

class SupportTicketMessageController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly SupportTicketMessageService $messageService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function store(StoreSupportTicketMessageRequest $request, SupportTicket $supportTicket): JsonResponse
    {
        $this->authorize('update', $supportTicket);
        $message = $this->messageService->handle($supportTicket, $request->validated());
        $this->auditLogger->record('support.ticket.message.created', $message, ['support_ticket_id' => $supportTicket->id]);

        return response()->json([
            'data' => [
                'id' => $message->id,
                'support_ticket_id' => $message->support_ticket_id,
                'created_by_user_id' => $message->created_by_user_id,
                'message_type' => $message->message_type,
                'message' => $message->message,
                'created_at' => $message->created_at?->toAtomString(),
            ],
        ], 201);
    }
}
