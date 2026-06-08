<?php

namespace App\Modules\Support\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SupportTicketMessage extends TenantModel
{
    protected $fillable = [
        'support_ticket_id',
        'created_by_user_id',
        'message_type',
        'message',
        'meta',
    ];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(SupportTicket::class, 'support_ticket_id');
    }
}
