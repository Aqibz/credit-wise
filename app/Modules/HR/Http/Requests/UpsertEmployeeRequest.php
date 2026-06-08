<?php

namespace App\Modules\HR\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpsertEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo('hr.manage', app(TenantManager::class)->current()?->tenant);
    }

    public function rules(): array
    {
        $employeeId = $this->route('employee')?->getKey();

        return [
            'user_id' => ['nullable', 'integer', 'min:1'],
            'employee_code' => ['required', 'string', 'max:50', Rule::unique('tenant.employees', 'employee_code')->ignore($employeeId)],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'department' => ['nullable', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:255'],
            'join_date' => ['required', 'date'],
            'basic_salary' => ['required', 'integer', 'min:0'],
            'status' => ['required', Rule::in(['active', 'inactive'])],
            'meta' => ['nullable', 'array'],
        ];
    }
}
