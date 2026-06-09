<?php

namespace App\Modules\Tenant\HR\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;

class StorePayrollRunRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo('hr.payroll.process', app(TenantManager::class)->current()?->tenant);
    }

    public function rules(): array
    {
        return [
            'period_start' => ['required', 'date'],
            'period_end' => ['required', 'date', 'after_or_equal:period_start'],
            'meta' => ['nullable', 'array'],
        ];
    }
}

