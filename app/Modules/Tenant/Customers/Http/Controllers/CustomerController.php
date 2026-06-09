<?php

namespace App\Modules\Tenant\Customers\Http\Controllers;

use App\Modules\Tenant\Customers\Http\Requests\UpsertCustomerRequest;
use App\Modules\Tenant\Customers\Models\Customer;
use App\Modules\Tenant\Customers\Queries\CustomerIndexQuery;
use App\Modules\Tenant\Customers\Resources\CustomerResource;
use App\Modules\Tenant\Customers\Services\CustomerUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CustomerController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly CustomerIndexQuery $indexQuery,
        private readonly CustomerUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Customer::class);

        $customers = $this->indexQuery->build($request)->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => CustomerResource::collection($customers->items()),
            'meta' => [
                'filters' => $request->only(['q', 'status']),
                'permissions' => [
                    'create' => $request->user()?->can('create', Customer::class),
                ],
                'pagination' => [
                    'current_page' => $customers->currentPage(),
                    'last_page' => $customers->lastPage(),
                    'per_page' => $customers->perPage(),
                    'total' => $customers->total(),
                ],
            ],
        ]);
    }

    public function store(UpsertCustomerRequest $request): JsonResponse
    {
        $this->authorize('create', Customer::class);

        $customer = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('customer.created', $customer, ['customer_id' => $customer->id]);

        return CustomerResource::make($customer)->response()->setStatusCode(201);
    }

    public function show(Customer $customer): CustomerResource
    {
        $this->authorize('view', $customer);

        return CustomerResource::make($customer->load('guarantors'));
    }

    public function update(UpsertCustomerRequest $request, Customer $customer): CustomerResource
    {
        $this->authorize('update', $customer);

        $customer = $this->upsertService->handle($request->validated(), $customer);
        $this->auditLogger->record('customer.updated', $customer, ['customer_id' => $customer->id]);

        return CustomerResource::make($customer);
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $this->authorize('delete', $customer);

        $customer->delete();
        $this->auditLogger->record('customer.deleted', $customer, ['customer_id' => $customer->id]);

        return response()->json(status: 204);
    }
}

