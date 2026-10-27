<?php

use Illuminate\Support\Facades\Route;

// Controller Imports
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Admin\Room\RoomController as AdminRoomController;
use App\Http\Controllers\Api\V1\Tenant\Room\RoomController as TenantRoomController;
use App\Http\Controllers\Api\V1\Meta\RoomsMetaController;
use App\Http\Controllers\Api\V1\Tenant\Booking\BookingController as TenantBookingController;
use App\Http\Controllers\Api\V1\Admin\Booking\BookingController as AdminBookingController;


Route::post('/register', [AuthController::class, 'register'])->name('register');
Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');

Route::get('/rooms/meta', [RoomsMetaController::class, 'meta'])->name('meta');

Route::prefix('/tenant')
    ->name('tenant.')->group(function () {
    Route::get('/rooms', [TenantRoomController::class, 'index'])->name('index');
    Route::get('/rooms/{id}', [TenantRoomController::class, 'show'])->name('show');
});

Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    Route::prefix('/admin')
        ->middleware('role:admin')
        ->name('admin.')->group(function () {
            Route::post('/create', [AdminRoomController::class, 'create'])->name('create');
            Route::get('/rooms', [AdminRoomController::class, 'index'])->name('index');
            Route::get('/rooms/{id}', [AdminRoomController::class, 'show'])->name('show');
            Route::patch('/update/{id}', [AdminRoomController::class, 'update'])->name('update');
            Route::delete('/delete', [AdminRoomController::class, 'delete'])->name('delete');
            Route::get('/bookings', [AdminBookingController::class, 'index'])->name('index');

            Route::prefix('/rooms')
                ->name('rooms.')->group(function () {
                    Route::get('/', [AdminRoomController::class, 'index'])->name('index');
                    Route::get('/{id}', [AdminRoomController::class, 'show'])->name('show');
                    Route::post('/bookings/reject', [AdminBookingController::class, 'reject'])->name('reject');
                });
    });

    Route::prefix('/tenant')
        ->middleware('role:tenant')
        ->name('tenant.')->group(function () {
            Route::get('/bookings', [TenantBookingController::class, 'index'])->name('index');
            Route::get('/rooms/book/{id}', [TenantBookingController::class, 'show'])->name('show');
            Route::post('/rooms/book/{id}', [TenantBookingController::class, 'book'])->name('book');
        });
});