<?php

namespace App\Modules\SuperAdmin\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TenantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'status' => $this->status,
            'database' => $this->database,
            'database_host' => $this->database_host,
            'database_port' => $this->database_port,
            'database_schema' => $this->database_schema,
            'primary_domain' => $this->activeDomain?->domain,
            'metadata' => $this->metadata ?? [],
            'created_at' => $this->created_at?->toAtomString(),
            'updated_at' => $this->updated_at?->toAtomString(),
        ];
    }
}
