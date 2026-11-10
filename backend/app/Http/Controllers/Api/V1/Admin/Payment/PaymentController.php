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

class PaymentController extends Controller
{
    public function showList()
    {
        $paymentRecords = PaymentRecord::query()
            ->select('id', 'booking_record_id', 'room_bill_id', 'amount', 'method')
            ->with([
                'bookingRecord' => fn ($q) => $q->select('id', 'room_id', 'move_in', 'move_out'),
                'bookingRecord.room' => fn ($q) => $q->select('id', 'name'),
                'roomBill' => fn ($q) => $q->select('id', 'payment_plan')
            ])
            ->paginate(10);
        
        return PaymentShowListResource::collection($paymentRecords);
    }
}
