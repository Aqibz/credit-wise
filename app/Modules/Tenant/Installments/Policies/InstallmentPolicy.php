<?php

namespace App\Modules\Tenant\Installments\Policies;

use App\Models\User;
use App\Modules\Tenant\Installments\Models\Installment;
use App\Shared\Tenancy\TenantManager;

class InstallmentPolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('installments.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, Installment $installment): bool
    {
        return $this->viewAny($user);
    }
}

