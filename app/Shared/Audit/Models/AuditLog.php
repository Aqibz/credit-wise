<?php

namespace App\Shared\Audit\Models;

use App\Shared\Database\LandlordModel;

class AuditLog extends LandlordModel
{
    protected $fillable = [
        'tenant_id',
        'actor_id',
        'event',
        'subject_type',
        'subject_id',
        'payload',
        'correlation_id',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }
}
