<?php

namespace App\Modules\Tenant\Purchases\Events;

use App\Modules\Tenant\Purchases\Models\PurchaseReceipt;
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

