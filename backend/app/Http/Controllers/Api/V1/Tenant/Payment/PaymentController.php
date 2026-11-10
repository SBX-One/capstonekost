<?php

namespace App\Http\Controllers\Api\V1\Tenant\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Model Imports
use App\Models\RoomBill;
use App\Models\PaymentRecord;
use App\Models\BookingRecord;

class PaymentController extends Controller
{
    public function showList()
    {
        $userId = Auth::id();

        $roomBills = BookingRecord::query()
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'total', 'status')
            ->with([
                'room' => fn ($q) => $q->select(
                    'id', 'name', 'room_type_id'
                ),
                'room.roomType' => fn ($q) => $q->select(
                    'id', 'name'
                ),
                'roomBill' => fn ($q) => $q->select(
                    'id', 'booking_record_id', 'payment_plan', 
                    'amount_left', 'status', 'next_due_date'
                ),
                'paymentRecord' => fn ($q) => $q->select(
                    'id', 'booking_record_id', 'amount'
                )
            ])
            ->where('user_id', $userId)
            ->whereIn('status', ['approved', 'active'])
            ->paginate(10);
    }
}
