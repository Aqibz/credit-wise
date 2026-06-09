<?php

namespace App\Modules\Tenant\Support\Models;

use App\Modules\Tenant\Contracts\Models\Contract;
use App\Modules\Tenant\Customers\Models\Customer;
use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends TenantModel
{
    protected $fillable = [
        'customer_id',
        'contract_id',
        'created_by_user_id',
        'assigned_user_id',
        'ticket_number',
        'subject',
        'channel',
        'priority',
        'status',
        'description',
        'resolved_at',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'resolved_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(SupportTicketMessage::class);
    }
}

