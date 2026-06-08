<?php

namespace App\Shared\Tenancy;

use App\Shared\Tenancy\Models\Tenant;

class CurrentTenant
{
    public function __construct(
        public readonly Tenant $tenant,
    ) {
    }
}
