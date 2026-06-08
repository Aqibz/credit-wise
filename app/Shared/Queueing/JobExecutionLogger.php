<?php

namespace App\Shared\Queueing;

use App\Shared\Logging\RequestContext;
use App\Shared\Queueing\Models\JobExecution;
use App\Shared\Tenancy\TenantManager;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;

class JobExecutionLogger
{
    public function __construct(
        private readonly TenantManager $tenantManager,
        private readonly RequestContext $requestContext,
    ) {
    }

    public function started(JobProcessing $event): void
    {
        JobExecution::query()->updateOrCreate(
            ['uuid' => $event->job->uuid()],
            [
                'tenant_id' => $this->tenantManager->current()?->tenant->id,
                'job_name' => $event->job->resolveName(),
                'queue' => $event->job->getQueue(),
                'status' => 'processing',
                'attempts' => $event->job->attempts(),
                'correlation_id' => $this->requestContext->requestId(),
                'started_at' => now(),
                'payload' => $event->job->payload(),
            ],
        );
    }

    public function succeeded(JobProcessed $event): void
    {
        JobExecution::query()
            ->where('uuid', $event->job->uuid())
            ->update([
                'status' => 'succeeded',
                'attempts' => $event->job->attempts(),
                'finished_at' => now(),
            ]);
    }

    public function failed(JobFailed $event): void
    {
        JobExecution::query()->updateOrCreate(
            ['uuid' => $event->job->uuid()],
            [
                'tenant_id' => $this->tenantManager->current()?->tenant->id,
                'job_name' => $event->job->resolveName(),
                'queue' => $event->job->getQueue(),
                'status' => 'failed',
                'attempts' => $event->job->attempts(),
                'correlation_id' => $this->requestContext->requestId(),
                'finished_at' => now(),
                'failure_reason' => $event->exception->getMessage(),
                'payload' => $event->job->payload(),
            ],
        );
    }
}
