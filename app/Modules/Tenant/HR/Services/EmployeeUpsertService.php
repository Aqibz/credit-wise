<?php

namespace App\Modules\Tenant\HR\Services;

use App\Modules\Tenant\HR\Models\Employee;
use Illuminate\Support\Facades\DB;

class EmployeeUpsertService
{
    public function handle(array $payload, ?Employee $employee = null): Employee
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $employee): Employee {
            $employee ??= new Employee();
            $employee->fill($payload)->save();

            return $employee->refresh();
        });
    }
}

