<?php

namespace App\Shared\Audit;

use App\Shared\Audit\Models\AuditLog;
use App\Shared\Logging\RequestContext;
use App\Shared\Tenancy\TenantManager;
use Illuminate\Contracts\Auth\Factory as AuthFactory;

class AuditLogger
{
    public function __construct(
        private readonly TenantManager $tenantManager,
        private readonly RequestContext $requestContext,
        private readonly AuthFactory $auth,
    ) {
    }

    public function record(string $event, mixed $subject = null, array $payload = []): AuditLog
    {
        return AuditLog::query()->create([
            'tenant_id' => $this->tenantManager->current()?->tenant->id,
            'actor_id' => $this->auth->guard()->id(),
            'event' => $event,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->getKey(),
            'payload' => $payload,
            'correlation_id' => $this->requestContext->requestId(),
        ]);
    }
}
