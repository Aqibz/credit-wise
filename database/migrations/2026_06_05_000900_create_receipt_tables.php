<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection($this->connection)->create('receipts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->restrictOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->string('receipt_number')->unique();
            $table->date('receipt_date')->index();
            $table->unsignedBigInteger('amount_received');
            $table->string('payment_method')->default('cash')->index();
            $table->string('external_reference')->nullable()->index();
            $table->string('idempotency_key')->nullable()->unique();
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['contract_id', 'receipt_date']);
            $table->index(['customer_id', 'receipt_date']);
        });

        Schema::connection($this->connection)->create('receipt_allocations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('receipt_id')->constrained('receipts')->cascadeOnDelete();
            $table->foreignId('installment_id')->constrained('installments')->restrictOnDelete();
            $table->unsignedBigInteger('allocated_amount');
            $table->timestamps();

            $table->unique(['receipt_id', 'installment_id']);
            $table->index(['installment_id', 'allocated_amount']);
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('receipt_allocations');
        Schema::connection($this->connection)->dropIfExists('receipts');
    }
};
