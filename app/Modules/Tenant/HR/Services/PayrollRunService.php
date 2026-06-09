<?php

namespace App\Modules\Tenant\HR\Services;

use App\Modules\Tenant\HR\Models\AttendanceRecord;
use App\Modules\Tenant\HR\Models\Employee;
use App\Modules\Tenant\HR\Models\PayrollRun;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PayrollRunService
{
    public function handle(array $payload): PayrollRun
    {
        return DB::connection('tenant')->transaction(function () use ($payload): PayrollRun {
            $payrollRun = PayrollRun::query()->firstOrCreate(
                [
                    'period_start' => $payload['period_start'],
                    'period_end' => $payload['period_end'],
                ],
                [
                    'status' => 'processed',
                    'processed_at' => now(),
                    'meta' => $payload['meta'] ?? null,
                ],
            );

            if ($payrollRun->items()->exists()) {
                return $payrollRun->load('items');
            }

            $periodStart = CarbonImmutable::parse($payload['period_start']);
            $periodEnd = CarbonImmutable::parse($payload['period_end']);
            $daysInPeriod = max(1, $periodStart->diffInDays($periodEnd) + 1);

            $employees = Employee::query()
                ->select(['id', 'basic_salary'])
                ->where('status', 'active')
                ->where('join_date', '<=', $periodEnd->toDateString())
                ->get();

            // Attendance is aggregated once for the whole payroll window to avoid one count query per employee.
            $attendanceCounts = AttendanceRecord::query()
                ->selectRaw('employee_id, count(*) as present_days')
                ->whereBetween('attendance_date', [$periodStart->toDateString(), $periodEnd->toDateString()])
                ->whereIn('status', ['present', 'paid_leave'])
                ->groupBy('employee_id')
                ->get()
                ->keyBy('employee_id');

            $items = $employees->map(function (Employee $employee) use ($attendanceCounts, $daysInPeriod): array {
                $presentDays = (int) ($attendanceCounts->get($employee->id)?->present_days ?? 0);
                $payableDays = min($daysInPeriod, max($presentDays, 0));
                $netAmount = (int) floor(($employee->basic_salary / $daysInPeriod) * $payableDays);

                return [
                    'employee_id' => $employee->id,
                    'basic_salary' => $employee->basic_salary,
                    'present_days' => $presentDays,
                    'payable_days' => $payableDays,
                    'gross_amount' => $employee->basic_salary,
                    'net_amount' => $netAmount,
                    'meta' => null,
                ];
            });

            if ($items->isNotEmpty()) {
                $payrollRun->items()->createMany($items->all());
            }

            $payrollRun->status = 'processed';
            $payrollRun->processed_at = now();
            $payrollRun->total_amount = (int) $items->sum('net_amount');
            $payrollRun->save();

            return $payrollRun->refresh()->load('items');
        });
    }
}

