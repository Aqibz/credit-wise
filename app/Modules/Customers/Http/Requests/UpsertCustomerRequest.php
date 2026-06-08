<?php

namespace App\Modules\Customers\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;
        $ability = $this->route('customer') ? 'customers.update' : 'customers.create';

        return (bool) $this->user()?->hasPermissionTo($ability, $tenant);
    }

    public function rules(): array
    {
        $customerId = $this->route('customer')?->getKey();

        return [
            'name' => ['required', 'string', 'max:255'],
            'cnic' => ['required', 'string', 'max:50', Rule::unique('tenant.customers', 'cnic')->ignore($customerId)],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'meta' => ['nullable', 'array'],
            'guarantors' => ['nullable', 'array'],
            'guarantors.*.name' => ['required_with:guarantors', 'string', 'max:255'],
            'guarantors.*.cnic' => ['required_with:guarantors', 'string', 'max:50'],
            'guarantors.*.phone' => ['nullable', 'string', 'max:50'],
            'guarantors.*.relationship' => ['nullable', 'string', 'max:100'],
        ];
    }
}
