<?php

namespace App\Modules\Tenant\Catalog\Services;

use App\Modules\Tenant\Catalog\Models\PricingPlan;
use Illuminate\Support\Facades\DB;

class PricingPlanUpsertService
{
    public function handle(array $payload, ?PricingPlan $pricingPlan = null): PricingPlan
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $pricingPlan): PricingPlan {
            $pricingPlan ??= new PricingPlan();
            $pricingPlan->fill($payload)->save();

            return $pricingPlan->refresh();
        });
    }
}

