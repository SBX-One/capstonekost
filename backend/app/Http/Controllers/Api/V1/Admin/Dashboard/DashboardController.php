<?php

namespace App\Http\Controllers\Api\V1\Admin\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Model Imports
use App\Models\Room;
use App\Models\BookingRecord;
use App\Models\PaymentRecord;

class DashboardController extends Controller
{
    public function index(Request $request) 
    {
        $roomOverview = Room::query()
            ->selectRaw("
                COUNT(*) AS total,
                SUM(status = 'available') AS available,
                SUM(status = 'occupied') AS occupied
                ")
            ->first();

        $bookingStatusOverview = BookingRecord::query()
            ->selectRaw("
                SUM(status = 'pending') AS pending,
                SUM(status = 'cancelled') AS cancelled,
                SUM(status = 'rejected') AS rejected,
                SUM(status = 'approved') AS approved,
                SUM(status = 'active') AS active,
                SUM(status = 'completed') AS completed
            ")
            ->first();
        
        $recentBookings = BookingRecord::query()
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'total', 'status')
            ->with([
                'room' => fn ($q) => $q->select('id', 'name'),
                'user' => fn ($q) => $q->select('id', 'name')
            ])
            ->latest('created_at')
            ->limit(5)
            ->get();
        
        $paymentThisMonth = PaymentRecord::query()
            ->select('id', 'amount')
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->get();
    } 
}
