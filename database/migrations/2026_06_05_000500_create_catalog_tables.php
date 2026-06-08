<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection($this->connection)->create('brands', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('active')->index();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('active')->index();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('sku')->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('status')->default('active')->index();
            $table->unsignedBigInteger('cash_price')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['brand_id', 'status']);
            $table->index(['category_id', 'status']);
        });

        Schema::connection($this->connection)->create('pricing_plans', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->unsignedSmallInteger('tenure_months');
            $table->unsignedBigInteger('down_payment')->default(0);
            $table->unsignedBigInteger('financed_amount')->default(0);
            $table->unsignedBigInteger('installment_amount')->default(0);
            $table->unsignedBigInteger('total_amount')->default(0);
            $table->string('status')->default('active')->index();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'slug']);
            $table->index(['product_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('pricing_plans');
        Schema::connection($this->connection)->dropIfExists('products');
        Schema::connection($this->connection)->dropIfExists('categories');
        Schema::connection($this->connection)->dropIfExists('brands');
    }
};
