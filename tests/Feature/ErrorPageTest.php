<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ErrorPageTest extends TestCase
{
    public function test_browser_failures_render_the_creditwise_error_page(): void
    {
        Route::post('/test-browser-error', fn () => abort(503));

        $this->post('/test-browser-error')
            ->assertStatus(503)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Error')
                ->where('status', 503)
                ->where('path', '/test-browser-error')
                ->has('requestId'));
    }

    public function test_api_failures_remain_json(): void
    {
        Route::post('/api/test-api-error', fn () => abort(503));

        $this->postJson('/api/test-api-error')
            ->assertStatus(503)
            ->assertHeader('content-type', 'application/json');
    }
}
