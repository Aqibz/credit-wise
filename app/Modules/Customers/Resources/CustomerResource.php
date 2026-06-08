<?php

namespace App\Modules\Customers\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'cnic' => $this->cnic,
            'phone' => $this->phone,
            'email' => $this->email,
            'city' => $this->city,
            'address' => $this->address,
            'status' => $this->status,
            'meta' => $this->meta ?? [],
            'guarantors' => $this->whenLoaded('guarantors', fn () => $this->guarantors->map(fn ($guarantor) => [
                'id' => $guarantor->id,
                'name' => $guarantor->name,
                'cnic' => $guarantor->cnic,
                'phone' => $guarantor->phone,
                'relationship' => $guarantor->relationship,
            ])->values()),
            'created_at' => $this->created_at?->toAtomString(),
            'updated_at' => $this->updated_at?->toAtomString(),
        ];
    }
}
