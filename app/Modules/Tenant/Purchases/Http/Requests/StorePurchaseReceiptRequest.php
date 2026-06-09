<?php

namespace App\Modules\Tenant\Purchases\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePurchaseReceiptRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;

        return (bool) $this->user()?->hasPermissionTo('purchases.receive', $tenant);
    }

    public function rules(): array
    {
        return [
            'reference' => ['required', 'string', 'max:255', Rule::unique('tenant.purchase_receipts', 'reference')],
            'received_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'meta' => ['nullable', 'array'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_order_item_id' => ['required', 'integer', Rule::exists('tenant.purchase_order_items', 'id')],
            'items.*.quantity_received' => ['required', 'integer', 'min:1'],
            'items.*.meta' => ['nullable', 'array'],
        ];
    }
}

