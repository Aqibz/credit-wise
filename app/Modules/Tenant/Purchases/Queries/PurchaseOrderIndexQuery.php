<?php

namespace App\Modules\Tenant\Purchases\Queries;

use App\Modules\Tenant\Purchases\Models\PurchaseOrder;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class PurchaseOrderIndexQuery
{
    public function build(Request $request): Builder
    {
        return PurchaseOrder::query()
            ->select([
                'id',
                'supplier_id',
                'warehouse_id',
                'reference',
                'status',
                'order_date',
                'expected_at',
                'subtotal_amount',
                'received_amount',
                'total_amount',
                'meta',
            ])
            ->with([
                'items:id,purchase_order_id,product_id,quantity_ordered,quantity_received,unit_cost,line_total',
            ])
            ->when(
                $request->filled('status'),
                fn (Builder $query) => $query->where('status', $request->string('status')->toString()),
            )
            ->orderByDesc('order_date')
            ->orderByDesc('id');
    }
}

