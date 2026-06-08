<?php

namespace App\Modules\SuperAdmin\Services;

use App\Shared\Tenancy\Models\Tenant;
use App\Shared\Tenancy\TenantManager;
use Illuminate\Support\Facades\Artisan;
use RuntimeException;

class TenantMigrationService
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function migrate(Tenant $tenant): void
    {
        $this->tenantManager->initialize($tenant);

        $exitCode = Artisan::call('migrate', [
            '--database' => config('tenancy.tenant_connection', 'tenant'),
            '--path' => database_path('migrations/tenant'),
            '--realpath' => true,
            '--force' => true,
        ]);

        if ($exitCode !== 0) {
            throw new RuntimeException(trim(Artisan::output()) ?: 'Tenant migrations failed.');
        }
    }
}
