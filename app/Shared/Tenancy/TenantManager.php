<?php

namespace App\Shared\Tenancy;

use App\Shared\Tenancy\Models\Tenant;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class TenantManager
{
    private ?CurrentTenant $current = null;

    public function current(): ?CurrentTenant
    {
        return $this->current;
    }

    public function initialize(Tenant $tenant): CurrentTenant
    {
        $connection = config('tenancy.tenant_connection', 'tenant');
        $baseConfig = Config::get("database.connections.{$connection}", []);
        $driver = Arr::get($baseConfig, 'driver', env('TENANT_DB_DRIVER', 'pgsql'));
        $targetDatabase = $tenant->database ?: Arr::get($baseConfig, 'database');

        if ($driver === 'sqlite' && Arr::get($baseConfig, 'database') === $targetDatabase) {
            return $this->current = new CurrentTenant($tenant);
        }

        Config::set("database.connections.{$connection}", array_filter([
            ...$baseConfig,
            'driver' => $driver,
            'host' => $tenant->database_host ?: Arr::get($baseConfig, 'host'),
            'port' => $tenant->database_port ?: Arr::get($baseConfig, 'port'),
            'database' => $targetDatabase,
            'username' => $tenant->database_username ?: Arr::get($baseConfig, 'username'),
            'password' => $tenant->database_password ?: Arr::get($baseConfig, 'password'),
            'search_path' => $tenant->database_schema ?: Arr::get($baseConfig, 'search_path'),
        ], static fn ($value) => $value !== null));

        DB::purge($connection);
        DB::reconnect($connection);

        return $this->current = new CurrentTenant($tenant);
    }

    public function forget(): void
    {
        $this->current = null;
    }
}
