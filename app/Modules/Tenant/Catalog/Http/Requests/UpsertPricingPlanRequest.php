<?php

namespace App\Modules\Tenant\Catalog\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertPricingPlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;
        $ability = $this->route('pricing_plan') ? 'catalog.update' : 'catalog.create';

        return (bool) $this->user()?->hasPermissionTo($ability, $tenant);
    }

    public function rules(): array
    {
        $pricingPlanId = $this->route('pricing_plan')?->getKey();

        return [
            'product_id' => ['required', 'integer', Rule::exists('tenant.products', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('tenant.pricing_plans', 'slug')
                    ->where(fn ($query) => $query->where('product_id', $this->integer('product_id')))
                    ->ignore($pricingPlanId),
            ],
            'tenure_months' => ['required', 'integer', 'min:1', 'max:120'],
            'down_payment' => ['required', 'integer', 'min:0'],
            'financed_amount' => ['required', 'integer', 'min:0'],
            'installment_amount' => ['required', 'integer', 'min:0'],
            'total_amount' => ['required', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'meta' => ['nullable', 'array'],
        ];
    }
}

