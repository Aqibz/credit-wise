<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Super Admin Routes
|--------------------------------------------------------------------------
|
| Landlord / control-plane routes should live here. Keep this file isolated
| from tenant routes so subscription management, support access, and tenant
| provisioning stay clearly separated.
|
*/

Route::middleware(['auth', 'verified'])
    ->prefix('super-admin')
    ->name('super-admin.')
    ->group(function (): void {
        Route::get('/', function () {
            return Inertia::render('SuperAdminApp');
        })->name('dashboard');

        Route::get('/{path}', function () {
            return Inertia::render('SuperAdminApp');
        })->where('path', '.*')->name('catch-all');
    });
