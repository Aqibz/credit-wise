<?php

namespace App\Modules\Recovery\Models;

use App\Modules\Contracts\Models\Contract;
use App\Modules\Installments\Models\Installment;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RecoveryCase extends TenantModel
{
    protected $fillable = [
        'contract_id',
        'installment_id',
        'assigned_user_id',
        'status',
        'opened_at',
        'last_contacted_at',
        'closed_at',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'last_contacted_at' => 'datetime',
            'closed_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function installment(): BelongsTo
    {
        return $this->belongsTo(Installment::class);
    }

    public function actions(): HasMany
    {
        return $this->hasMany(RecoveryAction::class);
    }
}
