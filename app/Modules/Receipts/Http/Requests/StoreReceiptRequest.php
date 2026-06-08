<?php

namespace App\Modules\Receipts\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;

        return (bool) $this->user()?->hasPermissionTo('payments.create', $tenant);
    }

    public function rules(): array
    {
        return [
            'contract_id' => ['required', 'integer', Rule::exists('tenant.contracts', 'id')],
            'receipt_number' => ['nullable', 'string', 'max:255', Rule::unique('tenant.receipts', 'receipt_number')],
            'receipt_date' => ['required', 'date'],
            'amount_received' => ['required', 'integer', 'min:1'],
            'payment_method' => ['required', Rule::in(['cash', 'bank_transfer', 'card', 'wallet'])],
            'external_reference' => ['nullable', 'string', 'max:255'],
            'idempotency_key' => ['nullable', 'string', 'max:255', Rule::unique('tenant.receipts', 'idempotency_key')],
            'notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
            'allocations' => ['nullable', 'array'],
            'allocations.*.installment_id' => ['required_with:allocations', 'integer', Rule::exists('tenant.installments', 'id')],
            'allocations.*.allocated_amount' => ['required_with:allocations', 'integer', 'min:1'],
        ];
    }
}
