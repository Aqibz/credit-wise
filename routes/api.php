<?php

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Mobile apps and external integrations should consume this API surface.
| Keep tenant-safe business APIs here and keep web Inertia routes out of this
| file. If the API grows, split v1 internals by domain under routes/api/.
|
*/

use App\Modules\Tenant\Accounts\Http\Controllers\AccountController;
use App\Modules\Tenant\Accounts\Http\Controllers\JournalEntryController;
use App\Modules\Tenant\Accounts\Http\Controllers\PurchaseReceiptLedgerPostingController;
use App\Modules\Tenant\Accounts\Http\Controllers\ReceiptLedgerPostingController;
use App\Modules\Tenant\Catalog\Http\Controllers\BrandController;
use App\Modules\Tenant\Catalog\Http\Controllers\CategoryController;
use App\Modules\Tenant\Catalog\Http\Controllers\PricingPlanController;
use App\Modules\Tenant\Catalog\Http\Controllers\ProductController;
use App\Modules\Tenant\Contracts\Http\Controllers\ContractController;
use App\Modules\Tenant\Contracts\Http\Controllers\ContractStatusController;
use App\Modules\Tenant\Customers\Http\Controllers\BlacklistEntryController;
use App\Modules\Tenant\Customers\Http\Controllers\CustomerController;
use App\Modules\Tenant\HR\Http\Controllers\AttendanceRecordController;
use App\Modules\Tenant\HR\Http\Controllers\EmployeeController;
use App\Modules\Tenant\HR\Http\Controllers\PayrollRunController;
use App\Modules\Tenant\Installments\Http\Controllers\ContractInstallmentScheduleController;
use App\Modules\Tenant\Installments\Http\Controllers\DueTrackingController;
use App\Modules\Tenant\Installments\Http\Controllers\InstallmentController;
use App\Modules\Tenant\Inventory\Http\Controllers\InventoryBalanceController;
use App\Modules\Tenant\Inventory\Http\Controllers\StockMovementController;
use App\Modules\Tenant\Inventory\Http\Controllers\WarehouseController;
use App\Modules\Tenant\Purchases\Http\Controllers\PurchaseOrderController;
use App\Modules\Tenant\Purchases\Http\Controllers\PurchaseOrderReceiptController;
use App\Modules\Tenant\Purchases\Http\Controllers\SupplierController;
use App\Modules\Tenant\Receipts\Http\Controllers\ReceiptController;
use App\Modules\Tenant\Recovery\Http\Controllers\RecoveryActionController;
use App\Modules\Tenant\Recovery\Http\Controllers\RecoveryCaseController;
use App\Modules\SuperAdmin\Http\Controllers\TenantController;
use App\Modules\Tenant\Support\Http\Controllers\SupportTicketController;
use App\Modules\Tenant\Support\Http\Controllers\SupportTicketMessageController;
use App\Shared\Tenancy\Http\Middleware\IdentifyTenant;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->prefix('v1')->group(function (): void {
    Route::prefix('super-admin')->group(function (): void {
        Route::apiResource('tenants', TenantController::class)->except(['create', 'edit']);
    });

    Route::middleware([IdentifyTenant::class])->prefix('app')->group(function (): void {
        Route::apiResource('customers', CustomerController::class)->except(['create', 'edit']);
        Route::apiResource('blacklist', BlacklistEntryController::class)->except(['create', 'edit', 'show']);

        Route::apiResource('accounts', AccountController::class)->except(['create', 'edit', 'destroy']);
        Route::apiResource('journal-entries', JournalEntryController::class)->only(['index', 'store', 'show'])->parameters(['journal-entries' => 'journalEntry']);
        Route::post('receipts/{receipt}/post-ledger', [ReceiptLedgerPostingController::class, 'store'])->name('receipts.post-ledger');
        Route::post('purchase-receipts/{purchaseReceipt}/post-ledger', [PurchaseReceiptLedgerPostingController::class, 'store'])->name('purchase-receipts.post-ledger');

        Route::apiResource('contracts', ContractController::class)->except(['create', 'edit']);
        Route::patch('contracts/{contract}/status', ContractStatusController::class)->name('contracts.status.update');
        Route::post('contracts/{contract}/installments/regenerate', [ContractInstallmentScheduleController::class, 'store'])->name('contracts.installments.regenerate');

        Route::apiResource('installments', InstallmentController::class)->only(['index', 'show']);
        Route::get('due-tracking', DueTrackingController::class)->name('due-tracking.index');
        Route::apiResource('receipts', ReceiptController::class)->only(['index', 'store', 'show']);

        Route::apiResource('brands', BrandController::class)->except(['create', 'edit']);
        Route::apiResource('categories', CategoryController::class)->except(['create', 'edit']);
        Route::apiResource('products', ProductController::class)->except(['create', 'edit']);
        Route::apiResource('pricing-plans', PricingPlanController::class)->except(['create', 'edit'])->parameters(['pricing-plans' => 'pricing_plan']);

        Route::apiResource('warehouses', WarehouseController::class)->except(['create', 'edit']);
        Route::get('inventory-balances', [InventoryBalanceController::class, 'index'])->name('inventory-balances.index');
        Route::apiResource('stock-movements', StockMovementController::class)->only(['index', 'store']);

        Route::apiResource('suppliers', SupplierController::class)->except(['create', 'edit', 'destroy']);
        Route::apiResource('purchase-orders', PurchaseOrderController::class)->except(['create', 'edit', 'destroy'])->parameters(['purchase-orders' => 'purchase_order']);
        Route::post('purchase-orders/{purchase_order}/receipts', [PurchaseOrderReceiptController::class, 'store'])->name('purchase-orders.receipts.store');

        Route::apiResource('recovery-cases', RecoveryCaseController::class)->except(['create', 'edit', 'destroy'])->parameters(['recovery-cases' => 'recovery_case']);
        Route::post('recovery-cases/{recovery_case}/actions', [RecoveryActionController::class, 'store'])->name('recovery-cases.actions.store');

        Route::apiResource('support-tickets', SupportTicketController::class)->except(['create', 'edit', 'destroy'])->parameters(['support-tickets' => 'support_ticket']);
        Route::post('support-tickets/{support_ticket}/messages', [SupportTicketMessageController::class, 'store'])->name('support-tickets.messages.store');

        Route::apiResource('employees', EmployeeController::class)->except(['create', 'edit', 'destroy']);
        Route::apiResource('attendance-records', AttendanceRecordController::class)->only(['index', 'store']);
        Route::apiResource('payroll-runs', PayrollRunController::class)->only(['index', 'store', 'show'])->parameters(['payroll-runs' => 'payroll_run']);
    });
});

