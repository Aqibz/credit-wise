<?php

namespace App\Modules\SuperAdmin\Models;

use App\Shared\Database\LandlordModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends LandlordModel
{
    protected $fillable = [
        'name',
        'slug',
        'billing_cycle',
        'price',
        'features',
    ];

    protected function casts(): array
    {
        return [
            'features' => 'array',
        ];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }
}
