<?php

namespace App\Modules\Purchases\Events;

use App\Modules\Purchases\Models\PurchaseReceipt;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PurchaseOrderReceived
{
    use Dispatchable;
    use SerializesModels;

    public function __construct(
        public PurchaseReceipt $purchaseReceipt,
    ) {
    }
}
