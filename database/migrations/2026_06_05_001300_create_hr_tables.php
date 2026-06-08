<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection($this->connection)->create('employees', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable()->index();
            $table->string('employee_code')->unique();
            $table->string('name');
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('department')->nullable()->index();
            $table->string('designation')->nullable()->index();
            $table->date('join_date')->index();
            $table->unsignedBigInteger('basic_salary')->default(0);
            $table->string('status')->default('active')->index();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['status', 'department']);
        });

        Schema::connection($this->connection)->create('attendance_records', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->date('attendance_date')->index();
            $table->string('status')->index();
            $table->timestamp('check_in_at')->nullable();
            $table->timestamp('check_out_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'attendance_date']);
            $table->index(['attendance_date', 'status']);
        });

        Schema::connection($this->connection)->create('payroll_runs', function (Blueprint $table): void {
            $table->id();
            $table->date('period_start')->index();
            $table->date('period_end')->index();
            $table->string('status')->default('draft')->index();
            $table->timestamp('processed_at')->nullable();
            $table->unsignedBigInteger('total_amount')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['period_start', 'period_end']);
        });

        Schema::connection($this->connection)->create('payroll_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('payroll_run_id')->constrained('payroll_runs')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->restrictOnDelete();
            $table->unsignedBigInteger('basic_salary');
            $table->unsignedInteger('present_days')->default(0);
            $table->unsignedInteger('payable_days')->default(0);
            $table->unsignedBigInteger('gross_amount');
            $table->unsignedBigInteger('net_amount');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['payroll_run_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('payroll_items');
        Schema::connection($this->connection)->dropIfExists('payroll_runs');
        Schema::connection($this->connection)->dropIfExists('attendance_records');
        Schema::connection($this->connection)->dropIfExists('employees');
    }
};
