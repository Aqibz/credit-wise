<?php

namespace App\Modules\HR\Policies;

use App\Models\User;
use App\Shared\Tenancy\TenantManager;

class HrPolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('hr.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, mixed $model): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('hr.manage', $this->tenantManager->current()?->tenant);
    }

    public function update(User $user, mixed $model): bool
    {
        return $this->create($user);
    }

    public function processPayroll(User $user): bool
    {
        return $user->hasPermissionTo('hr.payroll.process', $this->tenantManager->current()?->tenant);
    }
}
