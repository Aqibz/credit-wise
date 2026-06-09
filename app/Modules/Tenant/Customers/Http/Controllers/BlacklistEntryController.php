<?php

namespace App\Modules\Tenant\Customers\Http\Controllers;

use App\Modules\Tenant\Customers\Http\Requests\UpsertBlacklistEntryRequest;
use App\Modules\Tenant\Customers\Models\BlacklistEntry;
use App\Modules\Tenant\Customers\Resources\BlacklistEntryResource;
use App\Modules\Tenant\Customers\Services\BlacklistEntryUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class BlacklistEntryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly BlacklistEntryUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', BlacklistEntry::class);

        $entries = BlacklistEntry::query()
            ->when(
                filled($request->string('q')->value()),
                fn ($query) => $query->where('cnic', 'like', '%'.$request->string('q')->value().'%'),
            )
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return response()->json([
            'data' => BlacklistEntryResource::collection($entries->items()),
            'meta' => [
                'pagination' => [
                    'current_page' => $entries->currentPage(),
                    'last_page' => $entries->lastPage(),
                    'per_page' => $entries->perPage(),
                    'total' => $entries->total(),
                ],
            ],
        ]);
    }

    public function store(UpsertBlacklistEntryRequest $request): JsonResponse
    {
        $this->authorize('create', BlacklistEntry::class);

        $entry = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('blacklist.created', $entry, ['cnic' => $entry->cnic]);

        return BlacklistEntryResource::make($entry)->response()->setStatusCode(201);
    }

    public function update(UpsertBlacklistEntryRequest $request, BlacklistEntry $blacklist): BlacklistEntryResource
    {
        $this->authorize('update', $blacklist);

        $entry = $this->upsertService->handle($request->validated(), $blacklist);
        $this->auditLogger->record('blacklist.updated', $entry, ['cnic' => $entry->cnic]);

        return BlacklistEntryResource::make($entry);
    }

    public function destroy(BlacklistEntry $blacklist): JsonResponse
    {
        $this->authorize('delete', $blacklist);

        $blacklist->delete();
        $this->auditLogger->record('blacklist.deleted', $blacklist, ['cnic' => $blacklist->cnic]);

        return response()->json(status: 204);
    }
}

