<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'landlord';

    public function up(): void
    {
        Schema::connection($this->connection)->create('tenants', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('database');
            $table->string('database_host')->nullable();
            $table->unsignedInteger('database_port')->nullable();
            $table->string('database_username')->nullable();
            $table->text('database_password')->nullable();
            $table->string('database_schema')->default('public');
            $table->string('status')->default('active');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('tenant_domains', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('domain')->unique();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('plans', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('billing_cycle')->default('monthly');
            $table->unsignedInteger('price')->default(0);
            $table->json('features')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('subscriptions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('plans')->cascadeOnDelete();
            $table->string('status')->default('trial');
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('roles', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('permissions', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('role_permission', function (Blueprint $table): void {
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->primary(['role_id', 'permission_id']);
        });

        Schema::connection($this->connection)->create('tenant_user_memberships', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('roles')->cascadeOnDelete();
            $table->string('status')->default('active');
            $table->timestamp('support_access_expires_at')->nullable();
            $table->timestamps();
            $table->unique(['tenant_id', 'user_id']);
        });

        Schema::connection($this->connection)->create('audit_logs', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('event');
            $table->string('subject_type')->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->string('correlation_id')->nullable()->index();
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('job_executions', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->nullOnDelete();
            $table->string('job_name');
            $table->string('queue')->nullable();
            $table->string('status')->index();
            $table->unsignedInteger('attempts')->default(0);
            $table->string('correlation_id')->nullable()->index();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finished_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('payload')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('features', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('scope')->nullable();
            $table->json('value')->nullable();
            $table->timestamps();
            $table->unique(['name', 'scope']);
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('features');
        Schema::connection($this->connection)->dropIfExists('job_executions');
        Schema::connection($this->connection)->dropIfExists('audit_logs');
        Schema::connection($this->connection)->dropIfExists('tenant_user_memberships');
        Schema::connection($this->connection)->dropIfExists('role_permission');
        Schema::connection($this->connection)->dropIfExists('permissions');
        Schema::connection($this->connection)->dropIfExists('roles');
        Schema::connection($this->connection)->dropIfExists('subscriptions');
        Schema::connection($this->connection)->dropIfExists('plans');
        Schema::connection($this->connection)->dropIfExists('tenant_domains');
        Schema::connection($this->connection)->dropIfExists('tenants');
    }
};
