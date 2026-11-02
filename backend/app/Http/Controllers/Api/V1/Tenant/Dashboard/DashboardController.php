<?php

namespace App\Http\Controllers\Api\V1\Tenant\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Model Imports
use App\Models\Room;
use App\Models\BookingRecord;
use App\Models\PaymentRecord;
use App\Models\RoomBill;

class DashboardController extends Controller
{
    public function index(Request $request) 
    {
        $userId = Auth::id();

        $bookingStatus = BookingRecord::query()
            ->selectRaw("
                SUM(status = 'pending') AS pending,
                SUM(status = 'active') AS active
            ")
            ->first();
        
        $thisMonthBill = BookingRecord::query()
            ->select('id')
            ->where('user_id', $userId)
            ->with([
                'roomBill' => fn ($q) => $q->select('id', 'booking_record_id', 'current_month_bill')
            ])
            ->get();

        $bookingHistory = BookingRecord::query()
            ->select('id', 'room_id', 'move_in', 'move_out', 'rental_duration', 'total', 'status')
            ->where('user_id', $userId)
            ->with([
                'room' => fn ($q) => $q->select('id', 'name', 'room_type_id', 'price', 'floor'),
                'room.roomType' => fn ($q) => $q->select('id', 'name'),
                'room.imagePaths' => fn ($q) => $q->select('id', 'room_id', 'image_path', 'sort_order')
            ])
            ->get();

        $paymentHistory = BookingRecord::query()
            ->select('id', 'room_id')
            ->where('user_id', $userId)
            ->with([
                'paymentRecord' => fn ($q) => $q->select('id', 'booking_record_id', 'amount', 'created_at'),
                'room' => fn ($q) => $q->select('id', 'name')
            ])
            ->get();

        $paymentHistory['total_amount_paid'] = $paymentHistory->sum(
            fn ($booking) => $booking->paymentRecord->sum('amount')
        );
    }
}
