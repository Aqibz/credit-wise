<?php

namespace App\Modules\Customers\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BlacklistEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'cnic' => $this->cnic,
            'reason' => $this->reason,
            'status' => $this->status,
            'listed_at' => $this->listed_at?->toAtomString(),
            'cleared_at' => $this->cleared_at?->toAtomString(),
        ];
    }
}
