<?php

namespace App\Modules\HR\Http\Controllers;

use App\Modules\HR\Http\Requests\UpsertEmployeeRequest;
use App\Modules\HR\Models\Employee;
use App\Modules\HR\Resources\EmployeeResource;
use App\Modules\HR\Services\EmployeeUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class EmployeeController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly EmployeeUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Employee::class);

        $employees = Employee::query()
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->when($request->filled('department'), fn ($query) => $query->where('department', $request->string('department')->toString()))
            ->orderBy('employee_code')
            ->paginate($request->integer('per_page', 15));

        return response()->json(['data' => EmployeeResource::collection($employees->items()), 'meta' => ['filters' => $request->only(['status', 'department']), 'pagination' => ['current_page' => $employees->currentPage(), 'last_page' => $employees->lastPage(), 'per_page' => $employees->perPage(), 'total' => $employees->total()]]]);
    }

    public function store(UpsertEmployeeRequest $request): JsonResponse
    {
        $this->authorize('create', Employee::class);
        $employee = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('hr.employee.created', $employee, ['employee_id' => $employee->id]);

        return EmployeeResource::make($employee)->response()->setStatusCode(201);
    }

    public function show(Employee $employee): EmployeeResource
    {
        $this->authorize('view', $employee);

        return EmployeeResource::make($employee);
    }

    public function update(UpsertEmployeeRequest $request, Employee $employee): EmployeeResource
    {
        $this->authorize('update', $employee);
        $employee = $this->upsertService->handle($request->validated(), $employee);
        $this->auditLogger->record('hr.employee.updated', $employee, ['employee_id' => $employee->id]);

        return EmployeeResource::make($employee);
    }
}
