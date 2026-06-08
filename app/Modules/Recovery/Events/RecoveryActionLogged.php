<?php

namespace App\Modules\Recovery\Events;

use App\Modules\Recovery\Models\RecoveryAction;
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
