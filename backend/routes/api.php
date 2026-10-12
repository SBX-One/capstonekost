<?php

use Illuminate\Support\Facades\Route;

// Controller Imports
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Admin\Room\RoomController as AdminRoomController;
use App\Http\Controllers\Api\V1\Tenant\Room\RoomController as TenantRoomController;

Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');

Route::prefix('/tenant')
    ->name('tenant.')->group(function () {
    Route::get('/rooms', [TenantRoomController::class, 'index'])->name('index');
});

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::prefix('/admin')
        ->middleware('role:admin')
        ->name('admin.')->group(function () {
            Route::post('/create', [AdminRoomController::class, 'create'])->name('create');
            Route::get('/rooms', [AdminRoomController::class, 'index'])->name('index');
            Route::get('/rooms/{id}', [AdminRoomController::class, 'show'])->name('show');
    });
});