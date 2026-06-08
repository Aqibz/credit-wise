<?php

namespace App\Modules\Accounts\Services;

use App\Modules\Accounts\Models\JournalEntry;
use DomainException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JournalEntryService
{
    public function handle(array $payload): JournalEntry
    {
        return DB::connection('tenant')->transaction(function () use ($payload): JournalEntry {
            $lines = collect($payload['lines']);
            $debit = $lines->sum('debit_amount');
            $credit = $lines->sum('credit_amount');

            if ($debit <= 0 || $debit !== $credit) {
                throw new DomainException('Journal entry must be balanced and greater than zero.');
            }

            $entry = JournalEntry::query()->create([
                'reference' => $payload['reference'] ?? $this->generateReference(),
                'entry_date' => $payload['entry_date'],
                'source_type' => $payload['source_type'] ?? null,
                'source_id' => $payload['source_id'] ?? null,
                'status' => $payload['status'] ?? 'posted',
                'description' => $payload['description'] ?? null,
                'total_debit' => $debit,
                'total_credit' => $credit,
                'meta' => $payload['meta'] ?? null,
            ]);

            $entry->lines()->createMany($lines->map(fn (array $line) => [
                'account_id' => $line['account_id'],
                'debit_amount' => $line['debit_amount'] ?? 0,
                'credit_amount' => $line['credit_amount'] ?? 0,
                'memo' => $line['memo'] ?? null,
                'meta' => $line['meta'] ?? null,
            ])->all());

            return $entry->refresh()->load('lines');
        });
    }

    public function firstOrCreateSourceEntry(string $sourceType, int $sourceId, array $payload): JournalEntry
    {
        $existing = JournalEntry::query()
            ->where('source_type', $sourceType)
            ->where('source_id', $sourceId)
            ->with('lines')
            ->first();

        return $existing ?? $this->handle($payload);
    }

    protected function generateReference(): string
    {
        return 'JV-'.now()->format('YmdHis').'-'.Str::upper(Str::random(6));
    }
}
