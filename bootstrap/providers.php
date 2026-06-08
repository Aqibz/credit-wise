<?php

use App\Providers\AppServiceProvider;
use App\Providers\AuthServiceProvider;
use App\Providers\QueueMonitoringServiceProvider;
use App\Providers\FeatureFlagServiceProvider;

return [
    AppServiceProvider::class,
    AuthServiceProvider::class,
    QueueMonitoringServiceProvider::class,
    FeatureFlagServiceProvider::class,
];
