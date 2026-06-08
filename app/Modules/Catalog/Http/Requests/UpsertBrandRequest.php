<?php

namespace App\Modules\Catalog\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertBrandRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;
        $ability = $this->route('brand') ? 'catalog.update' : 'catalog.create';

        return (bool) $this->user()?->hasPermissionTo($ability, $tenant);
    }

    public function rules(): array
    {
        $brandId = $this->route('brand')?->getKey();

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('tenant.brands', 'slug')->ignore($brandId)],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'meta' => ['nullable', 'array'],
        ];
    }
}
