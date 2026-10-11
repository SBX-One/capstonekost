<?php

use Illuminate\Support\Facades\Route;

// Controller Imports
use App\Http\Controllers\Api\V1\Auth\AuthController;

Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::middleware('auth:api')->group(function () {
    Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
});