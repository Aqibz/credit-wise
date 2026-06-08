<?php

namespace App\Modules\Contracts\Http\Requests;

use App\Modules\Contracts\Enums\ContractStatus;
use App\Shared\Tenancy\TenantManager;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateContractStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return (bool) $this->user()?->hasPermissionTo(
            'contracts.approve',
            app(TenantManager::class)->current()?->tenant,
        );
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in(ContractStatus::values())],
        ];
    }
}
