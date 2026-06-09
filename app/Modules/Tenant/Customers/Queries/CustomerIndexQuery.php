<?php

namespace App\Modules\Tenant\Customers\Queries;

use App\Modules\Tenant\Customers\Models\Customer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

class CustomerIndexQuery
{
    public function build(Request $request): Builder
    {
        return Customer::query()
            ->with('guarantors')
            ->when(
                filled($request->string('q')->value()),
                fn (Builder $query) => $query->where(function (Builder $inner) use ($request): void {
                    $search = $request->string('q')->value();
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('cnic', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                }),
            )
            ->when(
                filled($request->string('status')->value()),
                fn (Builder $query) => $query->where('status', $request->string('status')->value()),
            )
            ->latest();
    }
}

