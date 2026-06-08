<?php

namespace App\Modules\HR\Services;

use App\Modules\HR\Models\Employee;
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
