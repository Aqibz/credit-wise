<?php

namespace App\Modules\Tenant\Installments\Http\Controllers;

use App\Modules\Tenant\Installments\Models\Installment;
use App\Modules\Tenant\Installments\Queries\DueTrackingQuery;
use App\Modules\Tenant\Installments\Resources\InstallmentResource;
use App\Shared\Http\Pagination\ApiPagination;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class DueTrackingController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly DueTrackingQuery $dueTrackingQuery,
        private readonly ApiPagination $pagination,
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Installment::class);

        $installments = $this->dueTrackingQuery
            ->build($request)
            ->paginate($this->pagination->perPage($request));

        return response()->json([
            'data' => InstallmentResource::collection($installments->items()),
            'meta' => [
                'filters' => $request->only(['window']),
                'pagination' => $this->pagination->meta($installments),
            ],
        ]);
    }
}

