<?php

namespace App\Modules\Catalog\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;
        $ability = $this->route('product') ? 'catalog.update' : 'catalog.create';

        return (bool) $this->user()?->hasPermissionTo($ability, $tenant);
    }

    public function rules(): array
    {
        $productId = $this->route('product')?->getKey();

        return [
            'brand_id' => ['nullable', 'integer', Rule::exists('tenant.brands', 'id')],
            'category_id' => ['nullable', 'integer', Rule::exists('tenant.categories', 'id')],
            'sku' => ['required', 'string', 'max:255', Rule::unique('tenant.products', 'sku')->ignore($productId)],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('tenant.products', 'slug')->ignore($productId)],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'cash_price' => ['required', 'integer', 'min:0'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
