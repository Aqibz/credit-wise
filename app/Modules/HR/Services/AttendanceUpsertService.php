<?php

namespace App\Modules\HR\Services;

use App\Modules\HR\Models\AttendanceRecord;
use Illuminate\Support\Facades\DB;

class AttendanceUpsertService
{
    public function handle(array $payload): AttendanceRecord
    {
        return DB::connection('tenant')->transaction(function () use ($payload): AttendanceRecord {
            $attendance = AttendanceRecord::query()->updateOrCreate(
                [
                    'employee_id' => $payload['employee_id'],
                    'attendance_date' => $payload['attendance_date'],
                ],
                $payload,
            );

            return $attendance->refresh();
        });
    }
}
