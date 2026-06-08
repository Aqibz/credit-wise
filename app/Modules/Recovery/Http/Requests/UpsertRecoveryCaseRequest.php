<?php

namespace App\Modules\Recovery\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertRecoveryCaseRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;

        return (bool) $this->user()?->hasPermissionTo('recovery.manage', $tenant);
    }

    public function rules(): array
    {
        return [
            'contract_id' => ['required', 'integer', Rule::exists('tenant.contracts', 'id')],
            'installment_id' => ['nullable', 'integer', Rule::exists('tenant.installments', 'id')],
            'assigned_user_id' => ['nullable', 'integer', 'min:1'],
            'status' => ['required', Rule::in(['open', 'in_progress', 'resolved', 'closed'])],
            'opened_at' => ['required', 'date'],
            'last_contacted_at' => ['nullable', 'date'],
            'closed_at' => ['nullable', 'date'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
