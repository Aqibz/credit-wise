<?php

namespace App\Modules\Accounts\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo('accounts.manage', app(TenantManager::class)->current()?->tenant);
    }

    public function rules(): array
    {
        $accountId = $this->route('account')?->getKey();

        return [
            'parent_id' => ['nullable', 'integer', Rule::exists('tenant.accounts', 'id')],
            'code' => ['required', 'string', 'max:50', Rule::unique('tenant.accounts', 'code')->ignore($accountId)],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(['asset', 'liability', 'equity', 'income', 'expense'])],
            'nature' => ['required', Rule::in(['debit', 'credit'])],
            'is_system' => ['nullable', 'boolean'],
            'is_active' => ['nullable', 'boolean'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
