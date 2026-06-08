<?php

namespace App\Providers;

use App\Models\User;
use App\Modules\Accounts\Models\Account;
use App\Modules\Accounts\Models\JournalEntry;
use App\Modules\Accounts\Policies\AccountingPolicy;
use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\PricingPlan;
use App\Modules\Catalog\Models\Product;
use App\Modules\Catalog\Policies\CatalogPolicy;
use App\Modules\Contracts\Models\Contract;
use App\Modules\Contracts\Policies\ContractPolicy;
use App\Modules\Customers\Models\BlacklistEntry;
use App\Modules\Customers\Models\Customer;
use App\Modules\Customers\Policies\BlacklistEntryPolicy;
use App\Modules\Customers\Policies\CustomerPolicy;
use App\Modules\HR\Models\AttendanceRecord;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Models\PayrollRun;
use App\Modules\HR\Policies\HrPolicy;
use App\Modules\Installments\Models\Installment;
use App\Modules\Installments\Policies\InstallmentPolicy;
use App\Modules\Inventory\Models\InventoryBalance;
use App\Modules\Inventory\Models\StockMovement;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Inventory\Policies\InventoryPolicy;
use App\Modules\Purchases\Models\PurchaseOrder;
use App\Modules\Purchases\Models\PurchaseReceipt;
use App\Modules\Purchases\Models\Supplier;
use App\Modules\Purchases\Policies\PurchasePolicy;
use App\Modules\Receipts\Models\Receipt;
use App\Modules\Receipts\Policies\ReceiptPolicy;
use App\Modules\Recovery\Models\RecoveryCase;
use App\Modules\Recovery\Policies\RecoveryCasePolicy;
use App\Modules\Support\Models\SupportTicket;
use App\Modules\Support\Policies\SupportPolicy;
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
