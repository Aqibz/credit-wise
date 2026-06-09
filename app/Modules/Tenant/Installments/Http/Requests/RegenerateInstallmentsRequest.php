<?php

namespace App\Modules\Tenant\Installments\Http\Requests;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;

class RegenerateInstallmentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $tenant = app(TenantManager::class)->current()?->tenant;

        return (bool) $this->user()?->hasPermissionTo('contracts.approve', $tenant);
    }

    public function rules(): array
    {
        return [
            'force' => ['nullable', 'boolean'],
        ];
    }
}

