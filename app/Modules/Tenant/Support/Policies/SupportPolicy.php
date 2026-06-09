<?php

namespace App\Modules\Tenant\Support\Policies;

use App\Models\User;
use App\Shared\Tenancy\TenantManager;

class SupportPolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('support.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, mixed $model): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('support.manage', $this->tenantManager->current()?->tenant);
    }

    public function update(User $user, mixed $model): bool
    {
        return $this->create($user);
    }
}

