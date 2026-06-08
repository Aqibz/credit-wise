<?php

namespace App\Modules\SuperAdmin\Services;

use App\Shared\Tenancy\Models\Tenant;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use RuntimeException;

class TenantDatabaseProvisioner
{
    public function provision(Tenant $tenant): void
    {
        $driver = config('database.connections.tenant.driver', env('TENANT_DB_DRIVER', 'pgsql'));

        match ($driver) {
            'pgsql' => $this->provisionPostgres($tenant),
            'sqlite' => $this->provisionSqlite($tenant),
            default => throw new RuntimeException("Tenant provisioning is not implemented for driver [{$driver}]."),
        };
    }

    protected function provisionPostgres(Tenant $tenant): void
    {
        $database = $tenant->database;

        if ($database === null || $database === '') {
            throw new RuntimeException('Tenant database name cannot be empty.');
        }

        $exists = DB::connection('landlord')
            ->table('pg_database')
            ->where('datname', $database)
            ->exists();

        if (! $exists) {
            DB::connection('landlord')->unprepared(sprintf(
                'CREATE DATABASE "%s"',
                str_replace('"', '""', $database),
            ));
        }
    }

    protected function provisionSqlite(Tenant $tenant): void
    {
        $database = $tenant->database;

        if ($database === null || $database === '') {
            throw new RuntimeException('Tenant database path cannot be empty.');
        }

        $directory = dirname($database);

        if (! is_dir($directory)) {
            File::ensureDirectoryExists($directory);
        }

        if (! file_exists($database)) {
            File::put($database, '');
        }
    }
}
