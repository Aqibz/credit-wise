<?php

namespace App\Shared\Tenancy;

use App\Shared\Tenancy\Models\Tenant;
use App\Shared\Tenancy\Models\TenantDomain;
use Illuminate\Http\Request;

class TenantResolver
{
    public function resolve(Request $request): ?Tenant
    {
        $identifier = trim((string) $request->header(config('tenancy.header', 'X-Tenant')));

        if ($identifier !== '') {
            return Tenant::query()
                ->where('slug', $identifier)
                ->orWhere('id', $identifier)
                ->first();
        }

        if (! config('tenancy.identify_by_domain', true)) {
            return null;
        }

        $host = strtolower((string) $request->getHost());

        if ($host === '' || in_array($host, ['127.0.0.1', 'localhost'], true)) {
            return null;
        }

        $domain = TenantDomain::query()
            ->with('tenant')
            ->where('domain', $host)
            ->first();

        return $domain?->tenant;
    }
}
