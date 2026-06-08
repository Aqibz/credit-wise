<?php

namespace App\Modules\Installments\Http\Controllers;

use App\Modules\Installments\Models\Installment;
use App\Modules\Installments\Queries\InstallmentIndexQuery;
use App\Modules\Installments\Resources\InstallmentResource;
use App\Shared\Http\Pagination\ApiPagination;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class InstallmentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly InstallmentIndexQuery $indexQuery,
        private readonly ApiPagination $pagination,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Installment::class);

        $installments = $this->indexQuery
            ->build($request)
            ->paginate($this->pagination->perPage($request));

        return response()->json([
            'data' => InstallmentResource::collection($installments->items()),
            'meta' => [
                'filters' => $request->only(['contract_id', 'status']),
                'pagination' => $this->pagination->meta($installments),
            ],
        ]);
    }

    public function show(Installment $installment): InstallmentResource
    {
        $this->authorize('view', $installment);

        return InstallmentResource::make($installment->loadMissing('contract:id,reference,customer_id'));
    }
}
