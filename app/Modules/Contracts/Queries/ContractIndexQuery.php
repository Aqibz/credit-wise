<?php

namespace App\Modules\Contracts\Queries;

use App\Modules\Contracts\Models\Contract;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ContractIndexQuery
{
    public function build(Request $request): Builder
    {
        return Contract::query()
            ->select([
                'id',
                'reference',
                'customer_id',
                'status',
                'cash_price',
                'down_payment',
                'financed_amount',
                'tenure_months',
                'monthly_installment',
                'product_snapshot',
                'plan_snapshot',
                'meta',
                'approved_at',
                'closed_at',
                'created_at',
                'updated_at',
            ])
            ->with(['customer:id,name,cnic'])
            ->when(
                filled($request->string('q')->value()),
                fn (Builder $query) => $query->where(function (Builder $inner) use ($request): void {
                    $search = $request->string('q')->value();
                    $inner->where('reference', 'like', "%{$search}%")
                        ->orWhereHas('customer', fn (Builder $customer) => $customer->where('name', 'like', "%{$search}%"));
                }),
            )
            ->when(
                filled($request->string('status')->value()),
                fn (Builder $query) => $query->where('status', $request->string('status')->value()),
            )
            ->latest();
    }
}
