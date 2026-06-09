<?php

namespace App\Modules\Tenant\Customers\Services;

use App\Modules\Tenant\Customers\Models\Customer;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CustomerUpsertService
{
    public function handle(array $payload, ?Customer $customer = null): Customer
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $customer): Customer {
            $customer ??= new Customer();

            $customer->fill(Arr::except($payload, ['guarantors']))->save();

            $guarantors = collect($payload['guarantors'] ?? [])
                ->map(fn (array $guarantor): array => Arr::only($guarantor, ['name', 'cnic', 'phone', 'relationship']));

            $customer->guarantors()->delete();

            if ($guarantors->isNotEmpty()) {
                $customer->guarantors()->createMany($guarantors->all());
            }

            return $customer->load('guarantors');
        });
    }
}

