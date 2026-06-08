<?php

namespace App\Modules\SuperAdmin\Http\Controllers;

use App\Modules\SuperAdmin\DTOs\TenantSignupData;
use App\Modules\SuperAdmin\Http\Requests\TenantSignupRequest;
use App\Modules\SuperAdmin\Resources\TenantResource;
use App\Modules\SuperAdmin\Services\TenantSignupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Throwable;

class TenantSignupController extends Controller
{
    public function __construct(
        private readonly TenantSignupService $signupService,
    ) {
    }

    public function __invoke(TenantSignupRequest $request): JsonResponse
    {
        $tenant = $this->signupService->handle(TenantSignupData::fromArray($request->validated()));

        return response()->json([
            'data' => TenantResource::make($tenant->load('activeDomain'))->resolve(),
            'meta' => [
                'login_path' => sprintf('/%s/login', $tenant->slug),
            ],
        ], 201);
    }
}
