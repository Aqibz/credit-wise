<?php

namespace App\Modules\Tenant\Recovery\Policies;

use App\Models\User;
use App\Shared\Tenancy\TenantManager;

class RecoveryCasePolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('recovery.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, mixed $model): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('recovery.manage', $this->tenantManager->current()?->tenant);
    }

    public function update(User $user, mixed $model): bool
    {
        return $this->create($user);
    }
}

