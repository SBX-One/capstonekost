<?php

use Illuminate\Support\Facades\Route;

// Controller Imports
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Admin\Room\RoomController as AdminRoomController;
use App\Http\Controllers\Api\V1\Tenant\Room\RoomController as TenantRoomController;
use App\Http\Controllers\Api\V1\Meta\RoomsMetaController;
use App\Http\Controllers\Api\V1\Tenant\Booking\BookingController as TenantBookingController;
use App\Http\Controllers\Api\V1\Admin\Booking\BookingController as AdminBookingController;
use App\Http\Controllers\Api\V1\Admin\Dashboard\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Tenant\Dashboard\DashboardController as TenantDashboardController;
use App\Http\Controllers\Api\V1\Tenant\Payment\PaymentController as TenantPaymentController;
use App\Http\Controllers\Api\V1\Admin\Payment\PaymentController as AdminPaymentController;
use App\Http\Controllers\Api\V1\Admin\Facility\FacilityController;

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
            // =-=-=-=-=-=-=-=-= ROOMS =-=-=-=-=-=-=-=-=
            Route::post('/create', [AdminRoomController::class, 'create'])->name('create');
            Route::get('/rooms', [AdminRoomController::class, 'index'])->name('index');
            Route::get('/rooms/export', [AdminRoomController::class, 'export']);
            Route::get('/rooms/{id}', [AdminRoomController::class, 'show'])->name('show');
            Route::patch('/update/{id}', [AdminRoomController::class, 'update'])->name('update');
            Route::delete('/delete', [AdminRoomController::class, 'delete'])->name('delete');

            Route::prefix('/rooms')
                ->name('rooms.')->group(function () {
                    // =-=-=-=-=-=-=-=-= ROOMS =-=-=-=-=-=-=-=-=
                    Route::get('/', [AdminRoomController::class, 'index'])->name('index');
                    Route::get('/detail/{id}', [AdminRoomController::class, 'detail'])->name('detail');
                    Route::get('/{id}', [AdminRoomController::class, 'show'])->name('show');

                    // =-=-=-=-=-=-=-=-= BOOKINGS =-=-=-=-=-=-=-=-=
                    Route::post('/bookings/reject', [AdminBookingController::class, 'reject'])->name('reject');
                    Route::post('/bookings/approve', [AdminBookingController::class, 'approve'])->name('approve');

                    // =-=-=-=-=-=-=-=-= FACILITY =-=-=-=-=-=-=-=-=
                    Route::post('/facilities/add', [FacilityController::class, 'add']);
                });

            Route::prefix('/bookings')
                ->name('bookings.')->group(function () {
                    // =-=-=-=-=-=-=-=-= BOOKINGS =-=-=-=-=-=-=-=-=
                    Route::get('/', [AdminBookingController::class, 'index'])->name('index');
                    Route::get('/detail', [AdminBookingController::class, 'show'])->name('show');
                    Route::get('/export', [AdminBookingController::class, 'export']);
                });
            
            Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

            // =-=-=-=-=-=-=-=-= PAYMENTS =-=-=-=-=-=-=-=-=
            Route::prefix('/payments')
                ->name('payments.')->group(function () {
                    Route::get('/', [AdminPaymentController::class, 'showList'])->name('list');
                    Route::get('/detail', [AdminPaymentController::class, 'showDetail'])->name('list');
                    Route::get('/record', [AdminPaymentController::class, 'listBookings']);
                    Route::post('/record', [AdminPaymentController::class, 'recordPayment']);
                    Route::get('/export', [AdminPaymentController::class, 'export']);
                });

            // =-=-=-=-=-=-=-=-= ISSUES =-=-=-=-=-=-=-=-=
            Route::prefix('/issues')
                ->name('payments.')->group(function () {
                    Route::get('/', [AdminIssueController::class, 'showList']);
                    Route::get('/detail', [AdminIssueController::class, 'showDetail']);
                    Route::post('/handle', [AdminIssueController::class, 'issueHandle']);
                    Route::patch('/resolve', [AdminIssueController::class, 'issueResolve']);
                });
    });

    Route::prefix('/tenant')
        ->middleware('role:tenant')
        ->name('tenant.')->group(function () {
            Route::get('/bookings', [TenantBookingController::class, 'index'])->name('index');
            Route::get('/rooms/book/detail', [TenantBookingController::class, 'detail'])->name('detail');
            Route::get('/rooms/book/{id}', [TenantBookingController::class, 'show'])->name('show');
            Route::post('/rooms/book/{id}', [TenantBookingController::class, 'book'])->name('book');
            Route::post('/rooms/book/cancel/{id}', [TenantBookingController::class, 'cancel'])->name('cancel');
            Route::get('/dashboard', [TenantDashboardController::class, 'index'])->name('dashboard');

            // =-=-=-=-=-=-=-=-= PAYMENTS =-=-=-=-=-=-=-=-=
            Route::prefix('/payments')
                ->name('payments.')->group(function () {
                    Route::get('/', [TenantPaymentController::class, 'showList'])->name('list');
                    Route::get('/detail/{id}', [TenantPaymentController::class, 'showDetail'])->name('list');
                    Route::patch('/confirm', [TenantPaymentController::class, 'confirmPlan']);
                });

            // =-=-=-=-=-=-=-=-= ISSUES =-=-=-=-=-=-=-=-=
            Route::prefix('/issues')
                ->name('issues.')->group(function () {
                    Route::get('/', [TenantIssueController::class, 'showList']);
                    Route::get('/detail', [TenantIssueController::class, 'showDetail']);
                    Route::get('/form', [TenantIssueController::class, 'fetchActiveRooms']);
                    Route::post('/', [TenantIssueController::class, 'issueReport']);
                });
        });
}); 