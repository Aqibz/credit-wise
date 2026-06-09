<?php

namespace App\Modules\Tenant\Contracts\Http\Requests;

use App\Modules\Tenant\Contracts\Enums\ContractStatus;
use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertContractRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;
        $ability = $this->route('contract') ? 'contracts.update' : 'contracts.create';

        return (bool) $this->user()?->hasPermissionTo($ability, $tenant);
    }

    public function rules(): array
    {
        $contractId = $this->route('contract')?->getKey();

        return [
            'reference' => ['required', 'string', 'max:100', Rule::unique('tenant.contracts', 'reference')->ignore($contractId)],
            'customer_id' => ['required', 'integer', 'exists:tenant.customers,id'],
            'status' => ['required', Rule::in(ContractStatus::values())],
            'cash_price' => ['required', 'integer', 'min:0'],
            'down_payment' => ['required', 'integer', 'min:0'],
            'financed_amount' => ['required', 'integer', 'min:0'],
            'tenure_months' => ['required', 'integer', 'min:1'],
            'monthly_installment' => ['required', 'integer', 'min:0'],
            'product_snapshot' => ['required', 'array'],
            'plan_snapshot' => ['nullable', 'array'],
            'meta' => ['nullable', 'array'],
        ];
    }
}

