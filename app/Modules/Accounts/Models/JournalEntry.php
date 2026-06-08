<?php

namespace App\Modules\Accounts\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JournalEntry extends TenantModel
{
    protected $fillable = [
        'reference',
        'entry_date',
        'source_type',
        'source_id',
        'status',
        'description',
        'total_debit',
        'total_credit',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'entry_date' => 'date',
            'meta' => 'array',
        ];
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }
}
