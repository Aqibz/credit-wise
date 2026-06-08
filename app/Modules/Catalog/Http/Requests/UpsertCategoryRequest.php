<?php

namespace App\Modules\Catalog\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;
        $ability = $this->route('category') ? 'catalog.update' : 'catalog.create';

        return (bool) $this->user()?->hasPermissionTo($ability, $tenant);
    }

    public function rules(): array
    {
        $categoryId = $this->route('category')?->getKey();

        return [
            'parent_id' => ['nullable', 'integer', Rule::exists('tenant.categories', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('tenant.categories', 'slug')->ignore($categoryId)],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'meta' => ['nullable', 'array'],
        ];
    }
}
