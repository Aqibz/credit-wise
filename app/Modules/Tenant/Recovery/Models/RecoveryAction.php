<?php

namespace App\Modules\Tenant\Recovery\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecoveryAction extends TenantModel
{
    protected $fillable = [
        'recovery_case_id',
        'created_by_user_id',
        'action_type',
        'outcome',
        'promised_amount',
        'promised_date',
        'notes',
        'action_at',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'promised_date' => 'date',
            'action_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function recoveryCase(): BelongsTo
    {
        return $this->belongsTo(RecoveryCase::class);
    }
}

