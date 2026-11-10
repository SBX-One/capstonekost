<?php

namespace App\Http\Controllers\Api\V1\Admin\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Model Imports
use App\Models\BookingRecord;
use App\Models\RoomBill;
use App\Models\PaymentRecord;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Payment\PaymentShowListResource;
use App\Http\Resources\Api\V1\Admin\Payment\PaymentShowDetailResource;
use App\Http\Resources\Api\V1\Admin\Payment\PaymentListBookingsResource;

class PaymentController extends Controller
{
    public function showList()
    {
        $paymentRecords = PaymentRecord::query()
            ->select('id', 'booking_record_id', 'room_bill_id', 'amount', 'method', 'payment_date')
            ->with([
                'bookingRecord' => fn ($q) => $q->select('id', 'room_id', 'move_in', 'move_out'),
                'bookingRecord.room' => fn ($q) => $q->select('id', 'name'),
                'roomBill' => fn ($q) => $q->select('id', 'payment_plan')
            ])
            ->paginate(10);
        
        return PaymentShowListResource::collection($paymentRecords)
                ->additional([
                    'message' => 'Data fetched.'
                ]);
    }

    public function showDetail(Request $request)
    {
        $ids = $request->input('id');

        $paymentDetail = PaymentRecord::query()
            ->select('id', 'booking_record_id', 'room_bill_id', 'amount', 'method', 'payment_date', 'note')
            ->with([
                'bookingRecord' => fn ($q) => $q->select('id', 'room_id', 'move_in', 'move_out'),
                'bookingRecord.room' => fn ($q) => $q->select('id', 'room_type_id', 'name'),
                'bookingRecord.room.roomType' => fn ($q) => $q->select('id', 'name'),
                'roomBill' => fn ($q) => $q->select('id', 'payment_plan')
            ])
            ->whereIn('id', $ids)
            ->get();

        return PaymentShowDetailResource::collection($paymentDetail)
                ->additional([
                    'message' => 'Data fetched.'
                ]);
    }

    public function listBookings()
    {
        $bookings = BookingRecord::query()
            ->select('id', 'room_id', 'status')
            ->with([
                'room' => fn ($q) => $q->select('id', 'name'),
                'contact' => fn ($q) => $q->select('id', 'booking_record_id', 'name'),
            ])
            ->whereIn('status', ['approved', 'active'])
            ->get();

        return PaymentListBookingsResource::collection($bookings)
                ->additional([
                    'message' => 'Data fetched.'
                ]);
    }
}
