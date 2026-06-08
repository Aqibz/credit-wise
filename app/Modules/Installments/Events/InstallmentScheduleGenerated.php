<?php

namespace App\Modules\Installments\Events;

use App\Modules\Contracts\Models\Contract;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class InstallmentScheduleGenerated
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public Contract $contract,
        public int $installmentCount,
    ) {
    }
}
