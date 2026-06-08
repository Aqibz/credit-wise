<?php

namespace App\Modules\Accounts\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'code' => $this->code,
            'name' => $this->name,
            'type' => $this->type,
            'nature' => $this->nature,
            'is_system' => $this->is_system,
            'is_active' => $this->is_active,
            'meta' => $this->meta ?? [],
        ];
    }
}
