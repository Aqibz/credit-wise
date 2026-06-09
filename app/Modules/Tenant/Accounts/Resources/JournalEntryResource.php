<?php

namespace App\Modules\Tenant\Accounts\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JournalEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'entry_date' => $this->entry_date?->toDateString(),
            'source_type' => $this->source_type,
            'source_id' => $this->source_id,
            'status' => $this->status,
            'description' => $this->description,
            'total_debit' => $this->total_debit,
            'total_credit' => $this->total_credit,
            'meta' => $this->meta ?? [],
            'lines' => $this->whenLoaded('lines', fn () => $this->lines->map(fn ($line) => [
                'id' => $line->id,
                'account_id' => $line->account_id,
                'debit_amount' => $line->debit_amount,
                'credit_amount' => $line->credit_amount,
                'memo' => $line->memo,
            ])->values()),
        ];
    }
}

