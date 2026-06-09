<?php

namespace App\Modules\Tenant\Support\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSupportTicketMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo('support.manage', app(TenantManager::class)->current()?->tenant);
    }

    public function rules(): array
    {
        return [
            'created_by_user_id' => ['nullable', 'integer', 'min:1'],
            'message_type' => ['required', Rule::in(['comment', 'internal_note', 'resolution'])],
            'message' => ['required', 'string'],
            'meta' => ['nullable', 'array'],
        ];
    }
}

