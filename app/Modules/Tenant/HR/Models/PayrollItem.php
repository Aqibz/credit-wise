<?php

namespace App\Modules\Tenant\HR\Models;

use App\Shared\Database\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PayrollItem extends TenantModel
{
    protected $fillable = [
        'payroll_run_id',
        'employee_id',
        'basic_salary',
        'present_days',
        'payable_days',
        'gross_amount',
        'net_amount',
        'meta',
    ];

    protected function casts(): array
    {
        return ['meta' => 'array'];
    }

    public function payrollRun(): BelongsTo
    {
        return $this->belongsTo(PayrollRun::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}

