<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Website Routes
|--------------------------------------------------------------------------
|
| Public marketing, landing, documentation, and future non-tenant website
| pages belong in this file. Tenant app routes are loaded from tenant.php,
| auth routes from auth.php, and landlord routes from super-admin.php.
|
*/

Route::get('/', function () {
    return Inertia::render('CreditWiseApp');
})->name('home');

require __DIR__.'/auth.php';
require __DIR__.'/super-admin.php';
require __DIR__.'/tenant.php';
