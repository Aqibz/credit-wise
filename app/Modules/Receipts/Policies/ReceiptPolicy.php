<?php

namespace App\Modules\Receipts\Policies;

use App\Models\User;
use App\Modules\Receipts\Models\Receipt;
use App\Shared\Tenancy\TenantManager;

class ReceiptPolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('payments.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, Receipt $receipt): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('payments.create', $this->tenantManager->current()?->tenant);
    }
}
