<?php

namespace App\Shared\Queueing\Models;

use App\Shared\Database\LandlordModel;

class JobExecution extends LandlordModel
{
    protected $fillable = [
        'uuid',
        'tenant_id',
        'job_name',
        'queue',
        'status',
        'attempts',
        'correlation_id',
        'started_at',
        'finished_at',
        'failure_reason',
        'payload',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }
}
