<?php

namespace App\Modules\Tenant\Inventory\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStockMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;

        return (bool) $this->user()?->hasPermissionTo('inventory.manage', $tenant);
    }

    public function rules(): array
    {
        return [
            'warehouse_id' => ['required', 'integer', Rule::exists('tenant.warehouses', 'id')],
            'product_id' => ['required', 'integer', Rule::exists('tenant.products', 'id')],
            'type' => ['required', Rule::in(['opening', 'purchase_receipt', 'adjustment_in', 'adjustment_out'])],
            'quantity' => ['required', 'integer', 'not_in:0'],
            'unit_cost' => ['nullable', 'integer', 'min:0'],
            'reference_type' => ['nullable', 'string', 'max:255'],
            'reference_id' => ['nullable', 'integer', 'min:1'],
            'occurred_at' => ['required', 'date'],
            'meta' => ['nullable', 'array'],
        ];
    }
}

