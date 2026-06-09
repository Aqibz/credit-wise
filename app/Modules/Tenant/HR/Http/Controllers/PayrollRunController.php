<?php

namespace App\Modules\Tenant\HR\Http\Controllers;

use App\Modules\Tenant\HR\Http\Requests\StorePayrollRunRequest;
use App\Modules\Tenant\HR\Models\PayrollRun;
use App\Modules\Tenant\HR\Resources\PayrollRunResource;
use App\Modules\Tenant\HR\Services\PayrollRunService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class PayrollRunController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly PayrollRunService $payrollRunService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', PayrollRun::class);

        $runs = PayrollRun::query()->with('items')->orderByDesc('period_end')->paginate($request->integer('per_page', 12));

        return response()->json(['data' => PayrollRunResource::collection($runs->items()), 'meta' => ['pagination' => ['current_page' => $runs->currentPage(), 'last_page' => $runs->lastPage(), 'per_page' => $runs->perPage(), 'total' => $runs->total()]]]);
    }

    public function store(StorePayrollRunRequest $request): JsonResponse
    {
        $this->authorize('processPayroll', PayrollRun::class);
        $run = $this->payrollRunService->handle($request->validated());
        $this->auditLogger->record('hr.payroll.processed', $run, ['payroll_run_id' => $run->id]);

        return PayrollRunResource::make($run)->response()->setStatusCode(201);
    }

    public function show(PayrollRun $payrollRun): PayrollRunResource
    {
        $this->authorize('view', $payrollRun);

        return PayrollRunResource::make($payrollRun->load('items'));
    }
}

