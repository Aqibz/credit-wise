<?php

namespace App\Modules\Tenant\Installments\Queries;

use App\Modules\Tenant\Installments\Models\Installment;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class InstallmentIndexQuery
{
    public function build(Request $request): Builder
    {
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
            ->with(['contract:id,reference,customer_id'])
            ->when($request->integer('contract_id'), fn (Builder $query, int $contractId) => $query->where('contract_id', $contractId))
            ->when($request->filled('status'), fn (Builder $query) => $query->where('status', $request->string('status')->toString()))
            ->orderBy('due_date')
            ->orderBy('sequence');
    }
}

