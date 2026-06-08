<?php

namespace App\Modules\Accounts\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PostPurchaseReceiptLedgerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo('accounts.post', app(TenantManager::class)->current()?->tenant);
    }

    public function rules(): array
    {
        return [
            'debit_account_id' => ['required', 'integer', Rule::exists('tenant.accounts', 'id')],
            'credit_account_id' => ['required', 'integer', Rule::exists('tenant.accounts', 'id'), 'different:debit_account_id'],
        ];
    }
}
