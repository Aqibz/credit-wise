<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('InstallemApp');
})->name('home');

Route::get('/{path}', function () {
    return Inertia::render('InstallemApp');
})->where('path', '.*');
