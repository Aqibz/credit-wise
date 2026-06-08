<?php

namespace App\Modules\HR\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Employee extends TenantModel
{
    protected $fillable = [
        'user_id',
        'employee_code',
        'name',
        'email',
        'phone',
        'department',
        'designation',
        'join_date',
        'basic_salary',
        'status',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'join_date' => 'date',
            'meta' => 'array',
        ];
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(AttendanceRecord::class);
    }

    public function payrollItems(): HasMany
    {
        return $this->hasMany(PayrollItem::class);
    }
}
