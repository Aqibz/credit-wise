<?php

namespace App\Shared\Tenancy\Http\Middleware;

use App\Shared\Tenancy\TenantManager;
use App\Shared\Tenancy\TenantResolver;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    public function __construct(
        private readonly TenantResolver $resolver,
        private readonly TenantManager $manager,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $this->manager->forget();

        $tenant = $this->resolver->resolve($request);

        if ($tenant === null && Str::startsWith($request->path(), 'api/v1/app')) {
            abort(404, 'Tenant could not be resolved.');
        }

        if ($tenant !== null) {
            $this->manager->initialize($tenant);
        }

        $response = $next($request);

        if ($tenant !== null) {
            $response->headers->set('X-Tenant', (string) $tenant->slug);
        }

        return $response;
    }
}
