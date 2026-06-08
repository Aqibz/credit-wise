<?php

namespace App\Shared\Logging\Http\Middleware;

use App\Shared\Logging\RequestContext;
use App\Shared\Tenancy\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AssignRequestContext
{
    public function __construct(
        private readonly RequestContext $context,
        private readonly TenantManager $tenantManager,
    ) {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $requestId = (string) Str::uuid();

        $this->context->setRequestId($requestId);

        Log::withContext([
            'request_id' => $requestId,
            'tenant_id' => $this->tenantManager->current()?->tenant->id,
            'path' => $request->path(),
        ]);

        $response = $next($request);
        $response->headers->set('X-Request-Id', $requestId);

        return $response;
    }
}
