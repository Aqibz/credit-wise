<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
        Schema::connection($this->connection)->create('suppliers', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable()->unique();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('status')->default('active')->index();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('purchase_orders', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->string('reference')->unique();
            $table->string('status')->default('draft')->index();
            $table->date('order_date');
            $table->timestamp('expected_at')->nullable();
            $table->unsignedBigInteger('subtotal_amount')->default(0);
            $table->unsignedBigInteger('received_amount')->default(0);
            $table->unsignedBigInteger('total_amount')->default(0);
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['supplier_id', 'status']);
            $table->index(['warehouse_id', 'status']);
        });

        Schema::connection($this->connection)->create('purchase_order_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->unsignedBigInteger('quantity_ordered');
            $table->unsignedBigInteger('quantity_received')->default(0);
            $table->unsignedBigInteger('unit_cost');
            $table->unsignedBigInteger('line_total');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->unique(['purchase_order_id', 'product_id']);
        });

        Schema::connection($this->connection)->create('purchase_receipts', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained('purchase_orders')->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->string('reference')->unique();
            $table->timestamp('received_at');
            $table->text('notes')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('purchase_receipt_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('purchase_receipt_id')->constrained('purchase_receipts')->cascadeOnDelete();
            $table->foreignId('purchase_order_item_id')->constrained('purchase_order_items')->restrictOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->unsignedBigInteger('quantity_received');
            $table->unsignedBigInteger('unit_cost');
            $table->unsignedBigInteger('line_total');
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['purchase_order_item_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::connection($this->connection)->dropIfExists('purchase_receipt_items');
        Schema::connection($this->connection)->dropIfExists('purchase_receipts');
        Schema::connection($this->connection)->dropIfExists('purchase_order_items');
        Schema::connection($this->connection)->dropIfExists('purchase_orders');
        Schema::connection($this->connection)->dropIfExists('suppliers');
    }
};
