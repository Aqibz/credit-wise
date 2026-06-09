<?php

namespace App\Modules\Tenant\Receipts\Queries;

use App\Modules\Tenant\Receipts\Models\Receipt;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class ReceiptIndexQuery
{
    public function build(Request $request): Builder
    {
        return Receipt::query()
            ->select([
                'id',
                'contract_id',
                'customer_id',
                'receipt_number',
                'receipt_date',
                'amount_received',
                'payment_method',
                'external_reference',
                'notes',
                'meta',
                'created_at',
                'updated_at',
            ])
            ->with(['allocations:id,receipt_id,installment_id,allocated_amount'])
            ->when($request->integer('contract_id'), fn (Builder $query, int $contractId) => $query->where('contract_id', $contractId))
            ->when($request->integer('customer_id'), fn (Builder $query, int $customerId) => $query->where('customer_id', $customerId))
            ->orderByDesc('receipt_date')
            ->orderByDesc('id');
    }
}

