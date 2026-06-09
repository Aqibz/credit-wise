<?php

namespace App\Modules\Tenant\Catalog\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Brand extends TenantModel
{
    protected $fillable = ['name', 'slug', 'status', 'meta'];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}

