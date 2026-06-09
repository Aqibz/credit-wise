<?php

namespace App\Modules\Tenant\Accounts\Policies;

use App\Models\User;
use App\Shared\Tenancy\TenantManager;

class AccountingPolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('accounts.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, mixed $model): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('accounts.manage', $this->tenantManager->current()?->tenant);
    }

    public function update(User $user, mixed $model): bool
    {
        return $this->create($user);
    }

    public function post(User $user, mixed $model = null): bool
    {
        return $user->hasPermissionTo('accounts.post', $this->tenantManager->current()?->tenant);
    }
}

