<?php

namespace App\Modules\HR\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'employee_id' => $this->employee_id,
            'attendance_date' => $this->attendance_date?->toDateString(),
            'status' => $this->status,
            'check_in_at' => $this->check_in_at?->toAtomString(),
            'check_out_at' => $this->check_out_at?->toAtomString(),
            'meta' => $this->meta ?? [],
        ];
    }
}
