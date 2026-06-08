<?php

namespace App\Modules\Inventory\Events;

use App\Modules\Inventory\Models\StockMovement;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class StockMovementRecorded
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public StockMovement $stockMovement,
    ) {
    }
}
