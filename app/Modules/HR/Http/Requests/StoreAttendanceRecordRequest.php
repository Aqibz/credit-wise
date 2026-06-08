<?php

namespace App\Modules\HR\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAttendanceRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo('hr.manage', app(TenantManager::class)->current()?->tenant);
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', Rule::exists('tenant.employees', 'id')],
            'attendance_date' => ['required', 'date'],
            'status' => ['required', Rule::in(['present', 'absent', 'paid_leave', 'unpaid_leave'])],
            'check_in_at' => ['nullable', 'date'],
            'check_out_at' => ['nullable', 'date'],
            'meta' => ['nullable', 'array'],
        ];
    }
}
