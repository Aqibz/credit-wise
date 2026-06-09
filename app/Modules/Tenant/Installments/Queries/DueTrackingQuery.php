<?php

namespace App\Modules\Tenant\Installments\Queries;

use App\Modules\Tenant\Installments\Models\Installment;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class DueTrackingQuery
{
    public function build(Request $request): Builder
    {
        $today = CarbonImmutable::today();
        $window = $request->string('window', 'all')->toString();

        return Installment::query()
            ->select([
                'id',
                'contract_id',
                'sequence',
                'due_date',
                'scheduled_amount',
                'principal_amount',
                'paid_amount',
                'outstanding_amount',
                'status',
                'paid_at',
                'meta',
                'created_at',
                'updated_at',
            ])
            ->with([
                'contract:id,reference,customer_id',
                'contract.customer:id,name,cnic',
            ])
            ->where('outstanding_amount', '>', 0)
            ->when($window === 'today', fn (Builder $query) => $query->whereDate('due_date', $today))
            ->when($window === 'due_3', fn (Builder $query) => $query->whereBetween('due_date', [$today->addDay(), $today->addDays(3)]))
            ->when($window === 'due_7', fn (Builder $query) => $query->whereBetween('due_date', [$today->addDays(4), $today->addDays(7)]))
            ->when($window === 'overdue', fn (Builder $query) => $query->whereDate('due_date', '<', $today))
            ->orderBy('due_date')
            ->orderBy('sequence');
    }
}

