<?php

namespace App\Modules\Tenant\Contracts\Events;

use App\Modules\Tenant\Contracts\Models\Contract;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContractCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public readonly Contract $contract,
    ) {
    }
}

