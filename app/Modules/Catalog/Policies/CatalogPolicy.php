<?php

namespace App\Modules\Catalog\Policies;

use App\Models\User;
use App\Shared\Tenancy\TenantManager;

class CatalogPolicy
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('catalog.view', $this->tenantManager->current()?->tenant);
    }

    public function view(User $user, mixed $model): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('catalog.create', $this->tenantManager->current()?->tenant);
    }

    public function update(User $user, mixed $model): bool
    {
        return $user->hasPermissionTo('catalog.update', $this->tenantManager->current()?->tenant);
    }

    public function delete(User $user, mixed $model): bool
    {
        return $user->hasPermissionTo('catalog.delete', $this->tenantManager->current()?->tenant);
    }
}
