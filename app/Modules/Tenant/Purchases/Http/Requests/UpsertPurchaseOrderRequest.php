<?php

namespace App\Modules\Tenant\Purchases\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertPurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;
        $ability = $this->route('purchase_order') ? 'purchases.update' : 'purchases.create';

        return (bool) $this->user()?->hasPermissionTo($ability, $tenant);
    }

    public function rules(): array
    {
        $purchaseOrderId = $this->route('purchase_order')?->getKey();

        return [
            'supplier_id' => ['required', 'integer', Rule::exists('tenant.suppliers', 'id')],
            'warehouse_id' => ['required', 'integer', Rule::exists('tenant.warehouses', 'id')],
            'reference' => ['required', 'string', 'max:255', Rule::unique('tenant.purchase_orders', 'reference')->ignore($purchaseOrderId)],
            'status' => ['required', Rule::in(['draft', 'ordered', 'partially_received', 'received', 'cancelled'])],
            'order_date' => ['required', 'date'],
            'expected_at' => ['nullable', 'date'],
            'meta' => ['nullable', 'array'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', Rule::exists('tenant.products', 'id')],
            'items.*.quantity_ordered' => ['required', 'integer', 'min:1'],
            'items.*.quantity_received' => ['nullable', 'integer', 'min:0'],
            'items.*.unit_cost' => ['required', 'integer', 'min:0'],
            'items.*.meta' => ['nullable', 'array'],
        ];
    }
}

