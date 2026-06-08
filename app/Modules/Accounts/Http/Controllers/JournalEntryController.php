<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Modules\Accounts\Http\Requests\StoreJournalEntryRequest;
use App\Modules\Accounts\Models\JournalEntry;
use App\Modules\Accounts\Resources\JournalEntryResource;
use App\Modules\Accounts\Services\JournalEntryService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class JournalEntryController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly JournalEntryService $journalEntryService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', JournalEntry::class);

        $entries = JournalEntry::query()->with('lines')->orderByDesc('entry_date')->paginate($request->integer('per_page', 20));

        return response()->json(['data' => JournalEntryResource::collection($entries->items()), 'meta' => ['pagination' => ['current_page' => $entries->currentPage(), 'last_page' => $entries->lastPage(), 'per_page' => $entries->perPage(), 'total' => $entries->total()]]]);
    }

    public function store(StoreJournalEntryRequest $request): JsonResponse
    {
        $this->authorize('create', JournalEntry::class);
        $entry = $this->journalEntryService->handle($request->validated());
        $this->auditLogger->record('accounts.journal.created', $entry, ['journal_entry_id' => $entry->id]);

        return JournalEntryResource::make($entry)->response()->setStatusCode(201);
    }

    public function show(JournalEntry $journalEntry): JournalEntryResource
    {
        $this->authorize('view', $journalEntry);

        return JournalEntryResource::make($journalEntry->load('lines'));
    }
}
