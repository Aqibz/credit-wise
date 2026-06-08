<?php

namespace App\Modules\Catalog\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PricingPlan extends TenantModel
{
    protected $fillable = [
        'product_id',
        'name',
        'slug',
        'tenure_months',
        'down_payment',
        'financed_amount',
        'installment_amount',
        'total_amount',
        'status',
        'meta',
    ];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
