<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    protected $connection = 'tenant';

    public function up(): void
    {
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

        Schema::connection($this->connection)->create('users', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('role_id')->nullable()->constrained('roles')->nullOnDelete();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('status')->default('active')->index();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('password_reset_tokens', function (Blueprint $table): void {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::connection($this->connection)->create('customers', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('cnic')->unique();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('city')->nullable();
            $table->string('address')->nullable();
            $table->string('status')->default('active');
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('customer_guarantors', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('name');
            $table->string('cnic');
            $table->string('phone')->nullable();
            $table->string('relationship')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('blacklist_entries', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('cnic')->index();
            $table->string('reason');
            $table->string('status')->default('active');
            $table->timestamp('listed_at')->nullable();
            $table->timestamp('cleared_at')->nullable();
            $table->timestamps();
        });

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

        Schema::connection($this->connection)->create('warehouses', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('status')->default('active')->index();
            $table->json('meta')->nullable();
            $table->timestamps();
        });

        Schema::connection($this->connection)->create('inventory_balances', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->bigInteger('on_hand')->default(0);
            $table->bigInteger('reserved')->default(0);
            $table->timestamps();
            $table->unique(['warehouse_id', 'product_id']);
        });

        Schema::connection($this->connection)->create('stock_movements', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('warehouse_id')->constrained('warehouses')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->string('type')->index();
            $table->bigInteger('quantity');
            $table->unsignedBigInteger('unit_cost')->nullable();
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['product_id', 'occurred_at']);
            $table->index(['warehouse_id', 'occurred_at']);
            $table->index(['reference_type', 'reference_id']);
        });

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

        Schema::connection($this->connection)->create('installments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contract_id')->constrained('contracts')->cascadeOnDelete();
            $table->unsignedSmallInteger('sequence');
            $table->date('due_date')->index();
            $table->unsignedBigInteger('scheduled_amount');
            $table->unsignedBigInteger('principal_amount')->default(0);
            $table->unsignedBigInteger('paid_amount')->default(0);
            $table->unsignedBigInteger('outstanding_amount');
            $table->string('status')->default('pending')->index();
            $table->timestamp('paid_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->unique(['contract_id', 'sequence']);
            $table->index(['status', 'due_date']);
            $table->index(['contract_id', 'status']);
        });

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

        Schema::connection($this->connection)->create('support_tickets', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('contract_id')->nullable()->constrained('contracts')->nullOnDelete();
            $table->unsignedBigInteger('created_by_user_id')->nullable()->index();
            $table->unsignedBigInteger('assigned_user_id')->nullable()->index();
            $table->string('ticket_number')->unique();
            $table->string('subject');
            $table->string('channel')->default('portal')->index();
            $table->string('priority')->default('medium')->index();
            $table->string('status')->default('open')->index();
            $table->text('description')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['assigned_user_id', 'status']);
        });

        Schema::connection($this->connection)->create('support_ticket_messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('support_ticket_id')->constrained('support_tickets')->cascadeOnDelete();
            $table->unsignedBigInteger('created_by_user_id')->nullable()->index();
            $table->string('message_type')->default('comment')->index();
            $table->text('message');
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['support_ticket_id', 'created_at']);
        });

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
        Schema::connection($this->connection)->dropIfExists('support_ticket_messages');
        Schema::connection($this->connection)->dropIfExists('support_tickets');
        Schema::connection($this->connection)->dropIfExists('journal_lines');
        Schema::connection($this->connection)->dropIfExists('journal_entries');
        Schema::connection($this->connection)->dropIfExists('accounts');
        Schema::connection($this->connection)->dropIfExists('recovery_actions');
        Schema::connection($this->connection)->dropIfExists('recovery_cases');
        Schema::connection($this->connection)->dropIfExists('receipt_allocations');
        Schema::connection($this->connection)->dropIfExists('receipts');
        Schema::connection($this->connection)->dropIfExists('installments');
        Schema::connection($this->connection)->dropIfExists('purchase_receipt_items');
        Schema::connection($this->connection)->dropIfExists('purchase_receipts');
        Schema::connection($this->connection)->dropIfExists('purchase_order_items');
        Schema::connection($this->connection)->dropIfExists('purchase_orders');
        Schema::connection($this->connection)->dropIfExists('suppliers');
        Schema::connection($this->connection)->dropIfExists('stock_movements');
        Schema::connection($this->connection)->dropIfExists('inventory_balances');
        Schema::connection($this->connection)->dropIfExists('warehouses');
        Schema::connection($this->connection)->dropIfExists('pricing_plans');
        Schema::connection($this->connection)->dropIfExists('products');
        Schema::connection($this->connection)->dropIfExists('categories');
        Schema::connection($this->connection)->dropIfExists('brands');
        Schema::connection($this->connection)->dropIfExists('contracts');
        Schema::connection($this->connection)->dropIfExists('blacklist_entries');
        Schema::connection($this->connection)->dropIfExists('customer_guarantors');
        Schema::connection($this->connection)->dropIfExists('customers');
        Schema::connection($this->connection)->dropIfExists('password_reset_tokens');
        Schema::connection($this->connection)->dropIfExists('users');
        Schema::connection($this->connection)->dropIfExists('role_permission');
        Schema::connection($this->connection)->dropIfExists('permissions');
        Schema::connection($this->connection)->dropIfExists('roles');
    }
};
