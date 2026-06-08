<?php

namespace App\Modules\HR\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayrollRunResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'period_start' => $this->period_start?->toDateString(),
            'period_end' => $this->period_end?->toDateString(),
            'status' => $this->status,
            'processed_at' => $this->processed_at?->toAtomString(),
            'total_amount' => $this->total_amount,
            'meta' => $this->meta ?? [],
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'employee_id' => $item->employee_id,
                'basic_salary' => $item->basic_salary,
                'present_days' => $item->present_days,
                'payable_days' => $item->payable_days,
                'gross_amount' => $item->gross_amount,
                'net_amount' => $item->net_amount,
            ])->values()),
        ];
    }
}
