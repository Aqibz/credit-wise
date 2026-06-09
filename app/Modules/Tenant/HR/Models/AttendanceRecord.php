<?php

namespace App\Modules\Tenant\HR\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceRecord extends TenantModel
{
    protected $fillable = [
        'employee_id',
        'attendance_date',
        'status',
        'check_in_at',
        'check_out_at',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'attendance_date' => 'date',
            'check_in_at' => 'datetime',
            'check_out_at' => 'datetime',
            'meta' => 'array',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}

