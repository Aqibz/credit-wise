<?php

namespace Tests\Feature\Backend;

use App\Modules\Catalog\Models\Brand;
use App\Modules\Catalog\Models\Category;
use App\Modules\Catalog\Models\Product;
use App\Modules\Inventory\Models\InventoryBalance;
use App\Modules\Inventory\Models\Warehouse;
use App\Modules\Purchases\Models\PurchaseOrder;
use App\Modules\Purchases\Models\Supplier;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\Feature\Backend\Concerns\CreatesTenantContext;
use Tests\TestCase;

class PurchaseReceiptInventoryFlowTest extends TestCase
{
    use CreatesTenantContext;
    use RefreshDatabase;

    public function test_purchase_receipt_updates_stock_balances(): void
    {
        [, $user] = $this->createTenantUserWithPermissions([
            'purchases.view',
            'purchases.create',
            'purchases.update',
            'purchases.receive',
            'inventory.view',
            'inventory.manage',
        ]);

        $brand = Brand::query()->create(['name' => 'Yamaha', 'slug' => 'yamaha', 'status' => 'active']);
        $category = Category::query()->create(['name' => 'Bike', 'slug' => 'bike', 'status' => 'active']);
        $product = Product::query()->create([
            'brand_id' => $brand->id,
            'category_id' => $category->id,
            'sku' => 'SKU-1001',
            'name' => 'YBR 125',
            'slug' => 'ybr-125',
            'status' => 'active',
            'cash_price' => 300000,
        ]);
        $warehouse = Warehouse::query()->create(['name' => 'Main Warehouse', 'code' => 'MAIN', 'status' => 'active']);
        $supplier = Supplier::query()->create(['name' => 'Bike Supplier', 'status' => 'active']);

        $purchaseOrder = PurchaseOrder::query()->create([
            'supplier_id' => $supplier->id,
            'warehouse_id' => $warehouse->id,
            'reference' => 'PO-1001',
            'status' => 'ordered',
            'order_date' => now()->toDateString(),
            'subtotal_amount' => 100000,
            'total_amount' => 100000,
        ]);

        $purchaseOrder->items()->create([
            'product_id' => $product->id,
            'quantity_ordered' => 2,
            'quantity_received' => 0,
            'unit_cost' => 50000,
            'line_total' => 100000,
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Tenant', 'model-town')
            ->postJson("/api/v1/app/purchase-orders/{$purchaseOrder->id}/receipts", [
                'reference' => 'PR-1001',
                'received_at' => now()->toAtomString(),
                'items' => [
                    [
                        'purchase_order_item_id' => $purchaseOrder->items()->firstOrFail()->id,
                        'quantity_received' => 2,
                    ],
                ],
            ]);

        $response->assertCreated()->assertJsonPath('data.reference', 'PR-1001');

        $balance = InventoryBalance::query()
            ->where('warehouse_id', $warehouse->id)
            ->where('product_id', $product->id)
            ->firstOrFail();

        $this->assertSame(2, $balance->on_hand);
        $this->assertSame('received', $purchaseOrder->fresh()->status);
    }
}
