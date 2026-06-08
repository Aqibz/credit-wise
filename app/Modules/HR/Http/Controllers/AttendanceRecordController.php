<?php

namespace App\Modules\HR\Http\Controllers;

use App\Modules\HR\Http\Requests\StoreAttendanceRecordRequest;
use App\Modules\HR\Models\AttendanceRecord;
use App\Modules\HR\Resources\AttendanceRecordResource;
use App\Modules\HR\Services\AttendanceUpsertService;
use App\Shared\Audit\AuditLogger;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AttendanceRecordController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly AttendanceUpsertService $upsertService,
        private readonly AuditLogger $auditLogger,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', AttendanceRecord::class);

        $records = AttendanceRecord::query()
            ->when($request->integer('employee_id'), fn ($query, int $employeeId) => $query->where('employee_id', $employeeId))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()))
            ->orderByDesc('attendance_date')
            ->paginate($request->integer('per_page', 31));

        return response()->json(['data' => AttendanceRecordResource::collection($records->items()), 'meta' => ['filters' => $request->only(['employee_id', 'status']), 'pagination' => ['current_page' => $records->currentPage(), 'last_page' => $records->lastPage(), 'per_page' => $records->perPage(), 'total' => $records->total()]]]);
    }

    public function store(StoreAttendanceRecordRequest $request): JsonResponse
    {
        $this->authorize('create', AttendanceRecord::class);
        $record = $this->upsertService->handle($request->validated());
        $this->auditLogger->record('hr.attendance.upserted', $record, ['attendance_record_id' => $record->id]);

        return AttendanceRecordResource::make($record)->response()->setStatusCode(201);
    }
}
