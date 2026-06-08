<?php

namespace App\Modules\HR\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayrollRun extends TenantModel
{
    protected $fillable = [
        'period_start',
        'period_end',
        'status',
        'processed_at',
        'total_amount',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'processed_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }
}
