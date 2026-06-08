<?php

namespace App\Modules\Accounts\Services;

use App\Modules\Accounts\Models\Account;
use Illuminate\Support\Facades\DB;

class AccountUpsertService
{
    public function handle(array $payload, ?Account $account = null): Account
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $account): Account {
            $account ??= new Account();
            $account->fill($payload)->save();

            return $account->refresh();
        });
    }
}
