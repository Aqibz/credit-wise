<?php

namespace App\Providers;

use App\Shared\Queueing\JobExecutionLogger;
use Illuminate\Queue\Events\JobFailed;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class QueueMonitoringServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Event::listen(JobProcessing::class, [JobExecutionLogger::class, 'started']);
        Event::listen(JobProcessed::class, [JobExecutionLogger::class, 'succeeded']);
        Event::listen(JobFailed::class, [JobExecutionLogger::class, 'failed']);
    }
}
