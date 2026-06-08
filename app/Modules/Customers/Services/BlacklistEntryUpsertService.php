<?php

namespace App\Modules\Customers\Services;

use App\Modules\Customers\Models\BlacklistEntry;
use Illuminate\Support\Facades\DB;

class BlacklistEntryUpsertService
{
    public function handle(array $payload, ?BlacklistEntry $entry = null): BlacklistEntry
    {
        return DB::connection('tenant')->transaction(function () use ($payload, $entry): BlacklistEntry {
            $entry ??= new BlacklistEntry();
            $entry->fill($payload)->save();

            return $entry->refresh();
        });
    }
}
