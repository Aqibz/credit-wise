<?php

use App\Shared\Logging\RequestContext;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Shared\Logging\Http\Middleware\AssignRequestContext::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(append: [
            \App\Shared\Logging\Http\Middleware\AssignRequestContext::class,
        ]);

        $middleware->priority([
            \App\Shared\Logging\Http\Middleware\AssignRequestContext::class,
            \App\Shared\Tenancy\Http\Middleware\IdentifyTenant::class,
            SubstituteBindings::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->respond(function (Response $response): Response {
            $request = request();
            $status = $response->getStatusCode();
            $props = [
                'status' => $status,
                'path' => '/'.$request->path(),
                'requestId' => app(RequestContext::class)->requestId(),
            ];

            if ($request->is('api/*') || ! in_array($status, [400, 401, 403, 404, 405, 408, 410, 413, 414, 419, 422, 429, 500, 502, 503, 504], true)) {
                return $response;
            }

            if (! is_file(public_path('hot')) && ! is_file(public_path('build/manifest.json'))) {
                return response()->view('errors.creditwise', $props, $status);
            }

            return Inertia::render('Error', $props)->toResponse($request)->setStatusCode($status);
        });
    })->create();
