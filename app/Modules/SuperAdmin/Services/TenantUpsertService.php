<?php

namespace App\Modules\SuperAdmin\Services;

use App\Shared\Tenancy\Models\Tenant;
use Illuminate\Support\Facades\DB;

class TenantUpsertService
{
    public function handle(array $payload, ?Tenant $tenant = null): Tenant
    {
        return DB::connection('landlord')->transaction(function () use ($payload, $tenant): Tenant {
            $tenant ??= new Tenant();

            $tenant->fill([
                'name' => $payload['name'],
                'slug' => $payload['slug'],
                'database' => $payload['database'],
                'database_host' => $payload['database_host'] ?? null,
                'database_port' => $payload['database_port'] ?? null,
                'database_username' => $payload['database_username'] ?? null,
                'database_password' => $payload['database_password'] ?? null,
                'database_schema' => $payload['database_schema'] ?? 'public',
                'status' => $payload['status'],
                'metadata' => $payload['metadata'] ?? [],
            ])->save();

            if (! empty($payload['primary_domain'])) {
                $tenant->domains()->update(['is_primary' => false]);
                $tenant->domains()->updateOrCreate(
                    ['domain' => strtolower($payload['primary_domain'])],
                    ['is_primary' => true],
                );
            }

            return $tenant->load('activeDomain');
        });
    }
}
