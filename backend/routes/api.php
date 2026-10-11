<?php

use Illuminate\Support\Facades\Route;

// Controller Imports
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Room\RoomController;

Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    
    Route::prefix('/admin')
        ->middleware('role:admin')->group(function () {
            Route::post('/create', [RoomController::class, 'create'])->name('create');
    });
});