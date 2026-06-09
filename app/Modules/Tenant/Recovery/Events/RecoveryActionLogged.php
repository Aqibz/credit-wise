<?php

namespace App\Modules\Tenant\Recovery\Events;

use App\Modules\Tenant\Recovery\Models\RecoveryAction;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RecoveryActionLogged
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public RecoveryAction $recoveryAction,
    ) {
    }
}

