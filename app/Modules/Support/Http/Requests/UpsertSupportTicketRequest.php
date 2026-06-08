<?php

namespace App\Modules\Support\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertSupportTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo('support.manage', app(TenantManager::class)->current()?->tenant);
    }

    public function rules(): array
    {
        $ticketId = $this->route('support_ticket')?->getKey();

        return [
            'customer_id' => ['nullable', 'integer', Rule::exists('tenant.customers', 'id')],
            'contract_id' => ['nullable', 'integer', Rule::exists('tenant.contracts', 'id')],
            'created_by_user_id' => ['nullable', 'integer', 'min:1'],
            'assigned_user_id' => ['nullable', 'integer', 'min:1'],
            'ticket_number' => ['nullable', 'string', 'max:255', Rule::unique('tenant.support_tickets', 'ticket_number')->ignore($ticketId)],
            'subject' => ['required', 'string', 'max:255'],
            'channel' => ['required', Rule::in(['portal', 'whatsapp', 'phone', 'email'])],
            'priority' => ['required', Rule::in(['low', 'medium', 'high', 'critical'])],
            'status' => ['required', Rule::in(['open', 'in_progress', 'resolved', 'closed'])],
            'description' => ['nullable', 'string'],
            'resolved_at' => ['nullable', 'date'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
