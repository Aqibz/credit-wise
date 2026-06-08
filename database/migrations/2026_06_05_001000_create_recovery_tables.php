<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection($this->connection)->create('recovery_cases', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->foreignId('installment_id')->nullable()->constrained('installments')->nullOnDelete();
            $table->unsignedBigInteger('assigned_user_id')->nullable()->index();
            $table->string('status')->default('open')->index();
            $table->timestamp('opened_at');
            $table->timestamp('last_contacted_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['contract_id', 'status']);
            $table->index(['installment_id', 'status']);
        });

        Schema::connection($this->connection)->create('recovery_actions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('recovery_case_id')->constrained('recovery_cases')->cascadeOnDelete();
            $table->unsignedBigInteger('created_by_user_id')->nullable()->index();
            $table->string('action_type')->index();
            $table->string('outcome')->nullable()->index();
            $table->unsignedBigInteger('promised_amount')->nullable();
            $table->date('promised_date')->nullable()->index();
            $table->text('notes')->nullable();
            $table->timestamp('action_at')->index();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('recovery_actions');
        Schema::connection($this->connection)->dropIfExists('recovery_cases');
    }
};
