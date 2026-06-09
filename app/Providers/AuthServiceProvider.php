<?php

namespace App\Providers;

use App\Models\User;
use App\Modules\Tenant\Accounts\Models\Account;
use App\Modules\Tenant\Accounts\Models\JournalEntry;
use App\Modules\Tenant\Accounts\Policies\AccountingPolicy;
use App\Modules\Tenant\Catalog\Models\Brand;
use App\Modules\Tenant\Catalog\Models\Category;
use App\Modules\Tenant\Catalog\Models\PricingPlan;
use App\Modules\Tenant\Catalog\Models\Product;
use App\Modules\Tenant\Catalog\Policies\CatalogPolicy;
use App\Modules\Tenant\Contracts\Models\Contract;
use App\Modules\Tenant\Contracts\Policies\ContractPolicy;
use App\Modules\Tenant\Customers\Models\BlacklistEntry;
use App\Modules\Tenant\Customers\Models\Customer;
use App\Modules\Tenant\Customers\Policies\BlacklistEntryPolicy;
use App\Modules\Tenant\Customers\Policies\CustomerPolicy;
use App\Modules\Tenant\HR\Models\AttendanceRecord;
use App\Modules\Tenant\HR\Models\Employee;
use App\Modules\Tenant\HR\Models\PayrollRun;
use App\Modules\Tenant\HR\Policies\HrPolicy;
use App\Modules\Tenant\Installments\Models\Installment;
use App\Modules\Tenant\Installments\Policies\InstallmentPolicy;
use App\Modules\Tenant\Inventory\Models\InventoryBalance;
use App\Modules\Tenant\Inventory\Models\StockMovement;
use App\Modules\Tenant\Inventory\Models\Warehouse;
use App\Modules\Tenant\Inventory\Policies\InventoryPolicy;
use App\Modules\Tenant\Purchases\Models\PurchaseOrder;
use App\Modules\Tenant\Purchases\Models\PurchaseReceipt;
use App\Modules\Tenant\Purchases\Models\Supplier;
use App\Modules\Tenant\Purchases\Policies\PurchasePolicy;
use App\Modules\Tenant\Receipts\Models\Receipt;
use App\Modules\Tenant\Receipts\Policies\ReceiptPolicy;
use App\Modules\Tenant\Recovery\Models\RecoveryCase;
use App\Modules\Tenant\Recovery\Policies\RecoveryCasePolicy;
use App\Modules\Tenant\Support\Models\SupportTicket;
use App\Modules\Tenant\Support\Policies\SupportPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::policy(Customer::class, CustomerPolicy::class);
        Gate::policy(BlacklistEntry::class, BlacklistEntryPolicy::class);
        Gate::policy(Contract::class, ContractPolicy::class);
        Gate::policy(Account::class, AccountingPolicy::class);
        Gate::policy(JournalEntry::class, AccountingPolicy::class);
        Gate::policy(Installment::class, InstallmentPolicy::class);
        Gate::policy(Receipt::class, ReceiptPolicy::class);
        Gate::policy(Brand::class, CatalogPolicy::class);
        Gate::policy(Category::class, CatalogPolicy::class);
        Gate::policy(Product::class, CatalogPolicy::class);
        Gate::policy(PricingPlan::class, CatalogPolicy::class);
        Gate::policy(Warehouse::class, InventoryPolicy::class);
        Gate::policy(InventoryBalance::class, InventoryPolicy::class);
        Gate::policy(StockMovement::class, InventoryPolicy::class);
        Gate::policy(Supplier::class, PurchasePolicy::class);
        Gate::policy(PurchaseOrder::class, PurchasePolicy::class);
        Gate::policy(PurchaseReceipt::class, PurchasePolicy::class);
        Gate::policy(RecoveryCase::class, RecoveryCasePolicy::class);
        Gate::policy(SupportTicket::class, SupportPolicy::class);
        Gate::policy(Employee::class, HrPolicy::class);
        Gate::policy(AttendanceRecord::class, HrPolicy::class);
        Gate::policy(PayrollRun::class, HrPolicy::class);

        Gate::before(static function (User $user, string $ability): ?bool {
            return $user->is_super_admin ? true : null;
        });
    }
}

