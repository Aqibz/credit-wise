<?php

namespace App\Providers;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Support\ServiceProvider;
use Laravel\Pennant\Feature;

class FeatureFlagServiceProvider extends ServiceProvider
{
    public function boot(TenantManager $tenantManager): void
    {
        Feature::define('module.customers', function () use ($tenantManager): bool {
            return $tenantManager->current() !== null;
        });

        Feature::define('module.contracts', function () use ($tenantManager): bool {
            return $tenantManager->current() !== null;
        });

        Feature::define('module.recovery.beta', function () use ($tenantManager): bool {
            $planFeatures = $tenantManager->current()?->tenant->metadata['features'] ?? [];

            return in_array('recovery', $planFeatures, true);
        });
    }
}
