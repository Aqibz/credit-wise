<?php

namespace App\Modules\Customers\Policies;

use App\Models\User;
use App\Modules\Customers\Models\BlacklistEntry;
use App\Shared\Tenancy\TenantManager;

class BlacklistEntryPolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('customers.view', $this->tenantManager->current()?->tenant);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('customers.blacklist.manage', $this->tenantManager->current()?->tenant);
    }

    public function update(User $user, BlacklistEntry $entry): bool
    {
        return $this->create($user);
    }

    public function delete(User $user, BlacklistEntry $entry): bool
    {
        return $this->create($user);
    }
}
