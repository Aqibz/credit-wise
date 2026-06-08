<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection($this->connection)->dropIfExists('contracts');

        Schema::connection($this->connection)->create('contracts', function (Blueprint $table): void {
            $table->id();
            $table->string('reference')->unique();
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->string('status')->default('Under Process')->index();
            $table->unsignedBigInteger('cash_price')->default(0);
            $table->unsignedBigInteger('down_payment')->default(0);
            $table->unsignedBigInteger('financed_amount')->default(0);
            $table->unsignedSmallInteger('tenure_months')->default(0);
            $table->unsignedBigInteger('monthly_installment')->default(0);
            $table->json('product_snapshot');
            $table->json('plan_snapshot')->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('contracts');
    }
};
