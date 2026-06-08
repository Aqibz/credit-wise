<?php

namespace App\Modules\SuperAdmin\Services;

use App\Modules\SuperAdmin\DTOs\TenantSignupData;
use App\Shared\Authz\PermissionCatalog;
use App\Shared\Authz\Models\TenantPermission;
use App\Shared\Authz\Models\TenantRole;
use App\Shared\Authz\Models\TenantUser;
use App\Shared\Tenancy\Models\Tenant;
use App\Shared\Tenancy\TenantManager;
use Illuminate\Support\Facades\DB;

class TenantBootstrapService
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function bootstrap(Tenant $tenant, TenantSignupData $data): void
    {
        $this->tenantManager->initialize($tenant);

        DB::connection('tenant')->transaction(function () use ($data): void {
            foreach (PermissionCatalog::all() as $permissionName) {
                TenantPermission::query()->firstOrCreate(['name' => $permissionName]);
            }

            $role = TenantRole::query()->firstOrCreate(
                ['slug' => 'tenant-admin'],
                ['name' => 'Tenant Admin', 'description' => 'Default tenant administrator'],
            );

            $role->permissions()->sync(TenantPermission::query()->pluck('id')->all());

            TenantUser::query()->updateOrCreate(
                ['email' => $data->adminEmail],
                [
                    'name' => $data->adminName,
                    'password' => $data->password,
                    'role_id' => $role->id,
                    'status' => 'active',
                    'email_verified_at' => now(),
                ],
            );
        });
    }
}
