<?php

namespace App\Modules\SuperAdmin\Services;

use App\Modules\SuperAdmin\DTOs\TenantSignupData;
use App\Modules\SuperAdmin\Models\Plan;
use App\Modules\SuperAdmin\Models\Subscription;
use App\Shared\Tenancy\Models\Tenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class TenantSignupService
{
    public function __construct(
        private readonly TenantDatabaseProvisioner $databaseProvisioner,
        private readonly TenantMigrationService $migrationService,
        private readonly TenantBootstrapService $bootstrapService,
    ) {
    }

    public function handle(TenantSignupData $data): Tenant
    {
        $plan = Plan::query()->where('slug', $data->planSlug)->firstOrFail();

        $tenant = DB::connection('landlord')->transaction(function () use ($data, $plan): Tenant {
            $tenant = Tenant::query()->create([
                'name' => $data->companyName,
                'slug' => Str::lower($data->companySlug),
                'database' => $this->databaseName($data->companySlug),
                'database_host' => env('TENANT_DB_HOST', env('DB_HOST', '127.0.0.1')),
                'database_port' => (int) env('TENANT_DB_PORT', env('DB_PORT', 5432)),
                'database_username' => env('TENANT_DB_USERNAME', env('DB_USERNAME')),
                'database_password' => env('TENANT_DB_PASSWORD', env('DB_PASSWORD')),
                'database_schema' => env('TENANT_DB_SCHEMA', 'public'),
                'status' => 'provisioning',
                'metadata' => ['plan_slug' => $plan->slug],
            ]);

            $tenant->domains()->create([
                'domain' => Str::lower($data->companySlug),
                'is_primary' => true,
            ]);

            Subscription::query()->create([
                'tenant_id' => $tenant->id,
                'plan_id' => $plan->id,
                'status' => 'active',
                'starts_at' => now(),
            ]);

            return $tenant;
        });

        try {
            $this->databaseProvisioner->provision($tenant);
            $this->migrationService->migrate($tenant);
            $this->bootstrapService->bootstrap($tenant, $data);

            $tenant->forceFill([
                'status' => 'active',
                'provisioned_at' => now(),
                'failed_reason' => null,
            ])->save();
        } catch (Throwable $throwable) {
            $tenant->forceFill([
                'status' => 'failed',
                'failed_reason' => $throwable->getMessage(),
            ])->save();

            throw $throwable;
        }

        return $tenant->fresh();
    }

    protected function databaseName(string $slug): string
    {
        $driver = config('database.connections.tenant.driver', env('TENANT_DB_DRIVER', 'pgsql'));
        $normalized = Str::of($slug)->lower()->replace('-', '_')->replaceMatches('/[^a-z0-9_]/', '')->value();

        if ($driver === 'sqlite') {
            return database_path(sprintf('tenants/%s.sqlite', $normalized));
        }

        return sprintf('tenant_%s', $normalized);
    }
}
