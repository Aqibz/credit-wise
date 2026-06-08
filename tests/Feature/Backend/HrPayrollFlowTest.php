<?php

namespace Tests\Feature\Backend;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Backend\Concerns\CreatesTenantContext;
use Tests\TestCase;

class HrPayrollFlowTest extends TestCase
{
    use CreatesTenantContext;
    use RefreshDatabase;

    public function test_employee_attendance_and_payroll_run_can_be_processed(): void
    {
        [, $user] = $this->createTenantUserWithPermissions([
            'hr.view',
            'hr.manage',
            'hr.payroll.process',
        ]);

        Sanctum::actingAs($user);

        $employeeResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson('/api/v1/app/employees', [
                'employee_code' => 'EMP-1001',
                'name' => 'Ahmed Khan',
                'department' => 'Recovery',
                'designation' => 'Officer',
                'join_date' => now()->toDateString(),
                'basic_salary' => 30000,
                'status' => 'active',
            ]);

        $employeeResponse->assertCreated();
        $employeeId = $employeeResponse->json('data.id');

        $attendanceResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson('/api/v1/app/attendance-records', [
                'employee_id' => $employeeId,
                'attendance_date' => now()->toDateString(),
                'status' => 'present',
            ]);

        $attendanceResponse->assertCreated()->assertJsonPath('data.status', 'present');

        $payrollResponse = $this->withHeader('X-Tenant', 'model-town')
            ->postJson('/api/v1/app/payroll-runs', [
                'period_start' => now()->toDateString(),
                'period_end' => now()->toDateString(),
            ]);

        $payrollResponse
            ->assertCreated()
            ->assertJsonPath('data.status', 'processed');

        $this->assertDatabaseCount('payroll_runs', 1, 'tenant');
    }
}
