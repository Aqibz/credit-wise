<?php

namespace App\Modules\Customers\Models;

use App\Modules\Contracts\Models\Contract;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends TenantModel
{
    protected $fillable = [
        'name',
        'cnic',
        'phone',
        'email',
        'city',
        'address',
        'status',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'meta' => 'array',
        ];
    }

    public function guarantors(): HasMany
    {
        return $this->hasMany(CustomerGuarantor::class);
    }

    public function blacklistEntries(): HasMany
    {
        return $this->hasMany(BlacklistEntry::class);
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }
}
