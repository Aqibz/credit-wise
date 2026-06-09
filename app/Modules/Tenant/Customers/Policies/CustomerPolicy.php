<?php

namespace App\Modules\Tenant\Customers\Policies;

use App\Models\User;
use App\Modules\Tenant\Customers\Models\Customer;
use App\Shared\Tenancy\TenantManager;

class CustomerPolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('customers.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, Customer $customer): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('customers.create', $this->tenantManager->current()?->tenant);
    }

    public function update(User $user, Customer $customer): bool
    {
        return $user->hasPermissionTo('customers.update', $this->tenantManager->current()?->tenant);
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $user->hasPermissionTo('customers.delete', $this->tenantManager->current()?->tenant);
    }
}

