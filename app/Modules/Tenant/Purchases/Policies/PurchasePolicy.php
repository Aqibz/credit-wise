<?php

namespace App\Modules\Tenant\Purchases\Policies;

use App\Models\User;
use App\Shared\Tenancy\TenantManager;

class PurchasePolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('purchases.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, mixed $model): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('purchases.create', $this->tenantManager->current()?->tenant);
    }

    public function update(User $user, mixed $model): bool
    {
        return $user->hasPermissionTo('purchases.update', $this->tenantManager->current()?->tenant);
    }

    public function receive(User $user, mixed $model): bool
    {
        return $user->hasPermissionTo('purchases.receive', $this->tenantManager->current()?->tenant);
    }
}

