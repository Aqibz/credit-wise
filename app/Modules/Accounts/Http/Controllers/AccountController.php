<?php

namespace App\Modules\Accounts\Http\Controllers;

use App\Modules\Accounts\Http\Requests\UpsertAccountRequest;
use App\Modules\Accounts\Models\Account;
use App\Modules\Accounts\Resources\AccountResource;
use App\Modules\Accounts\Services\AccountUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AccountController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly AccountUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Account::class);

        $accounts = Account::query()->orderBy('code')->paginate($request->integer('per_page', 20));

        return response()->json(['data' => AccountResource::collection($accounts->items()), 'meta' => ['pagination' => ['current_page' => $accounts->currentPage(), 'last_page' => $accounts->lastPage(), 'per_page' => $accounts->perPage(), 'total' => $accounts->total()]]]);
    }

    public function store(UpsertAccountRequest $request): JsonResponse
    {
        $this->authorize('create', Account::class);
        $account = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('accounts.account.created', $account, ['account_id' => $account->id]);

        return AccountResource::make($account)->response()->setStatusCode(201);
    }

    public function show(Account $account): AccountResource
    {
        $this->authorize('view', $account);

        return AccountResource::make($account);
    }

    public function update(UpsertAccountRequest $request, Account $account): AccountResource
    {
        $this->authorize('update', $account);
        $account = $this->upsertService->handle($request->validated(), $account);
        $this->auditLogger->record('accounts.account.updated', $account, ['account_id' => $account->id]);

        return AccountResource::make($account);
    }
}
