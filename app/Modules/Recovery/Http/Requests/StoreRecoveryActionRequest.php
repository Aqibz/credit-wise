<?php

namespace App\Modules\Recovery\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRecoveryActionRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;

        return (bool) $this->user()?->hasPermissionTo('recovery.manage', $tenant);
    }

    public function rules(): array
    {
        return [
            'created_by_user_id' => ['nullable', 'integer', 'min:1'],
            'action_type' => ['required', Rule::in(['call', 'visit', 'promise', 'notice', 'settlement'])],
            'outcome' => ['nullable', Rule::in(['pending', 'promised', 'resolved', 'failed'])],
            'promised_amount' => ['nullable', 'integer', 'min:0'],
            'promised_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'action_at' => ['required', 'date'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
