<?php

namespace App\Modules\Customers\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertBlacklistEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo(
            'customers.blacklist.manage',
            app(TenantManager::class)->current()?->tenant,
        );
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['nullable', 'integer', 'exists:tenant.customers,id'],
            'cnic' => ['required', 'string', 'max:50'],
            'reason' => ['required', 'string', 'max:500'],
            'status' => ['required', Rule::in(['active', 'cleared'])],
            'listed_at' => ['nullable', 'date'],
            'cleared_at' => ['nullable', 'date'],
        ];
    }
}
