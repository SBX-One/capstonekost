<?php

namespace App\Http\Controllers\Api\V1\Tenant\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Model Imports
use App\Models\RoomBill;
use App\Models\BookingRecord;

// Resource Imports
use App\Http\Resources\Api\V1\Tenant\Payment\PaymentShowListResource;
use App\Http\Resources\Api\V1\Tenant\Payment\PaymentShowDetailResource;

// Request Imports
use App\Http\Requests\Api\V1\Tenant\Payment\PaymentConfirmPlanRequest;
use App\Http\Requests\Api\V1\Tenant\Payment\PaymentShowDetailRequest;
use App\Http\Requests\Api\V1\Tenant\Payment\PaymentShowListRequest;
use App\Http\Resources\Api\V1\Tenant\Payment\PaymentCurrentResource;

class PaymentController extends Controller
{
    public function showList(PaymentShowListRequest $request)
    {
        $userId = Auth::id();
        
        $payload = $request->validated();

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
            ->withSum('paymentRecord as total_paid', 'amount')
            ->when(isset($payload['filter']), function ($q) use ($payload) {
                $q->whereHas('roomBill', function ($query) use ($payload) {
                    $query->where('status', $payload['filter']);
                });
            })
            ->where('user_id', $userId)
            ->whereIn('status', ['approved', 'active'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return PaymentShowListResource::collection($roomBills);
    }

    public function showCurrentPayment(string $id)
    {
        $userId = Auth::id();

        $detail = BookingRecord::query()
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total')
            ->with([
                'room' => fn ($q) => $q->select('id', 'name'),
                'roomBill' => fn ($q) => $q->select(
                    'id', 'booking_record_id', 'payment_plan', 
                    'status', 'current_month_bill', 'next_due_date'
                )
            ])
            ->where('user_id', $userId)
            ->findOrFail($id);

        return (new PaymentCurrentResource($detail));
    }

    public function confirmPlan(PaymentConfirmPlanRequest $request)
    {
         $userId = Auth::id();
         $payload = $request->validated();

         $roomBill = RoomBill::query()
            ->select('id', 'booking_record_id', 'payment_plan')
            ->with([
                'bookingRecord' => fn ($q) => $q->select('id', 'user_id')
            ])
            ->whereNull('payment_plan')
            ->whereHas('bookingRecord', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->findOrFail($payload['billing_id']);

        $roomBill->update([
            'payment_plan' => $payload['plan'],
        ]);

        return response()->json([
            'message' => 'Payment plan successfully updated.',
        ]);
    }

    public function showDetail(PaymentShowDetailRequest $request)
    {
        $userId = Auth::id();
        $ids = $request->validated('id');

        $paymentDetail = BookingRecord::query()
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total')
            ->with([
                'room' => fn ($q) => $q->select('id', 'name', 'room_type_id'),
                'room.roomType' => fn ($q) => $q->select('id', 'name'),
                'roomBill' => fn ($q) => $q
                    ->select('id', 'booking_record_id', 'payment_plan', 'status', 'amount_left')
                    ->withSum('paymentRecord as total_paid', 'amount')
            ])
            ->where('user_id', $userId)
            ->whereIn('id', $ids)
            ->orderBy('created_at', 'desc')
            ->get();

        return PaymentShowDetailResource::collection($paymentDetail);
    }
}
