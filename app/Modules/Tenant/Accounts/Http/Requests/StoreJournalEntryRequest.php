<?php

namespace App\Modules\Tenant\Accounts\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJournalEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo('accounts.manage', app(TenantManager::class)->current()?->tenant);
    }

    public function rules(): array
    {
        return [
            'reference' => ['nullable', 'string', 'max:255', Rule::unique('tenant.journal_entries', 'reference')],
            'entry_date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:500'],
            'status' => ['nullable', Rule::in(['posted'])],
            'meta' => ['nullable', 'array'],
            'lines' => ['required', 'array', 'min:2'],
            'lines.*.account_id' => ['required', 'integer', Rule::exists('tenant.accounts', 'id')],
            'lines.*.debit_amount' => ['nullable', 'integer', 'min:0'],
            'lines.*.credit_amount' => ['nullable', 'integer', 'min:0'],
            'lines.*.memo' => ['nullable', 'string', 'max:255'],
            'lines.*.meta' => ['nullable', 'array'],
        ];
    }
}

