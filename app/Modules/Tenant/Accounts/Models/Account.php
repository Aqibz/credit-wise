<?php

namespace App\Modules\Tenant\Accounts\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Account extends TenantModel
{
    protected $fillable = [
        'parent_id',
        'code',
        'name',
        'type',
        'nature',
        'is_system',
        'is_active',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'is_active' => 'boolean',
            'meta' => 'array',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function lines(): HasMany
    {
        return $this->hasMany(JournalLine::class);
    }
}

