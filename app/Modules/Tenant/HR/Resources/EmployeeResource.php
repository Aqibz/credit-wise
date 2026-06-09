<?php

namespace App\Modules\Tenant\HR\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'employee_code' => $this->employee_code,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'department' => $this->department,
            'designation' => $this->designation,
            'join_date' => $this->join_date?->toDateString(),
            'basic_salary' => $this->basic_salary,
            'status' => $this->status,
            'meta' => $this->meta ?? [],
        ];
    }
}

