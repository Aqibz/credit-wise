<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Tenant Application Routes
|--------------------------------------------------------------------------
|
| CreditWise tenant-facing routes live here. Today these routes render the
| Inertia app shell. Later this file is the right place for tenant domain
| middleware, tenant resolution, and tenant-only route groups.
|
*/

Route::get('/dashboard', function () {
    return Inertia::render('CreditWiseApp');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function (): void {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/{path}', function () {
    return Inertia::render('CreditWiseApp');
})->middleware(['auth', 'verified'])->where('path', '.*');
