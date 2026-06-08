<?php

namespace App\Http\Middleware;

use App\Shared\Tenancy\TenantManager;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    public function __construct(
        private readonly TenantManager $tenantManager,
    ) {
    }

    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $tenant = $this->tenantManager->current()?->tenant;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'permissions' => $tenant && $request->user()
                    ? $request->user()->roleFor($tenant)?->permissions->pluck('name')->values()->all() ?? []
                    : [],
            ],
            'tenant' => [
                'id' => $tenant?->id,
                'name' => $tenant?->name,
                'slug' => $tenant?->slug,
            ],
        ];
    }
}
