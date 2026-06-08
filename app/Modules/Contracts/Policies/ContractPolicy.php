<?php

namespace App\Modules\Contracts\Policies;

use App\Models\User;
use App\Modules\Contracts\Models\Contract;
use App\Shared\Tenancy\TenantManager;

class ContractPolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('contracts.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, Contract $contract): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('contracts.create', $this->tenantManager->current()?->tenant);
    }

    public function update(User $user, Contract $contract): bool
    {
        return $user->hasPermissionTo('contracts.update', $this->tenantManager->current()?->tenant);
    }

    public function transition(User $user, Contract $contract): bool
    {
        return $user->hasPermissionTo('contracts.approve', $this->tenantManager->current()?->tenant);
    }
}
