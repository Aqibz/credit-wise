<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection($this->connection)->create('accounts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('accounts')->nullOnDelete();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('type')->index();
            $table->string('nature')->index();
            $table->boolean('is_system')->default(false);
            $table->boolean('is_active')->default(true)->index();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['type', 'is_active']);
        });

        Schema::connection($this->connection)->create('journal_entries', function (Blueprint $table): void {
            $table->id();
            $table->string('reference')->unique();
            $table->date('entry_date')->index();
            $table->string('source_type')->nullable()->index();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->string('status')->default('posted')->index();
            $table->string('description')->nullable();
            $table->unsignedBigInteger('total_debit')->default(0);
            $table->unsignedBigInteger('total_credit')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['source_type', 'source_id']);
            $table->index(['entry_date', 'status']);
        });

        Schema::connection($this->connection)->create('journal_lines', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('journal_entry_id')->constrained('journal_entries')->cascadeOnDelete();
            $table->foreignId('account_id')->constrained('accounts')->restrictOnDelete();
            $table->unsignedBigInteger('debit_amount')->default(0);
            $table->unsignedBigInteger('credit_amount')->default(0);
            $table->string('memo')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['account_id', 'journal_entry_id']);
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('journal_lines');
        Schema::connection($this->connection)->dropIfExists('journal_entries');
        Schema::connection($this->connection)->dropIfExists('accounts');
    }
};
