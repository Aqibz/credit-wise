<?php

namespace App\Modules\Contracts\Events;

use App\Modules\Contracts\Models\Contract;
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
