<?php

namespace App\Modules\Receipts\Events;

use App\Modules\Receipts\Models\Receipt;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReceiptRecorded
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public Receipt $receipt,
    ) {
    }
}
