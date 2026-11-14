<?php

namespace App\Http\Controllers\Api\V1\Admin\Payment;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Model Imports
use App\Models\BookingRecord;
use App\Models\RoomBill;
use App\Models\PaymentRecord;
use App\Models\Room;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Payment\PaymentShowListResource;
use App\Http\Resources\Api\V1\Admin\Payment\PaymentShowDetailResource;
use App\Http\Resources\Api\V1\Admin\Payment\PaymentListBookingsResource;

// Request Imports
use App\Http\Requests\Api\V1\Admin\Payment\RecordPaymentRequest;
use App\Http\Requests\Api\V1\Admin\Payment\PaymentExportRequest;

// Exception Imports
use Illuminate\Validation\ValidationException;

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
            ->orderBy('created_at', 'desc')
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
                'roomBill' => fn ($q) => $q->select('id', 'booking_record_id', 'payment_plan')
            ])
            ->whereIn('status', ['approved', 'active'])
            ->whereHas('roomBill', function ($q) {
                $q->whereIn('payment_plan', ['monthly', 'full']);
            })
            ->get();

        return PaymentListBookingsResource::collection($bookings)
                ->additional([
                    'message' => 'Data fetched.'
                ]);
    }

    public function recordPayment(RecordPaymentRequest $request) 
    {
        $payload = $request->validated();

        $payment = DB::transaction(function () use (
            $payload
        ) {
            $booking = BookingRecord::query()
                ->select('id', 'status', 'total')
                ->with([
                    'roomBill' => fn ($q) => $q->select('id', 'booking_record_id', 'amount_left', 'payment_plan')
                ])
                ->findOrFail($payload['bookings_id']);

            if (!in_array($booking->status, ['approved', 'active'])) {
                throw ValidationException::withMessages([
                    'bookings_id' => [
                        'Payment can only be made for bookings with approved or active status.',
                    ],
                ]);
            }

            if (!in_array($booking->roomBill->payment_plan, ['monthly', 'full'])) {
                throw ValidationException::withMessages([
                    'bookings_id' => [
                        'Payment can only be made for bookings with chosen payment plan.',
                    ],
                ]);
            }

            if ($payload['amount'] > $booking['roomBill']->amount_left) {
                throw ValidationException::withMessages([
                    'amount' => [
                        'Payment amount cannot exceed the remaining balance.',
                    ],
                ]);
            }

            if (
                $booking->roomBill->payment_plan === 'full' &&
                $payload['amount'] != $booking->roomBill->amount_left
            ) {
                throw ValidationException::withMessages([
                    'amount' => [
                        'Payment must cover the full remaining balance for bookings with a full payment plan.',
                    ],
                ]);
            }

            $payment = PaymentRecord::query()
                ->create([
                    'booking_record_id' => $booking->id,
                    'room_bill_id' => $booking->roomBill->id,
                    'amount' => $payload['amount'],
                    'method' => $payload['method'],
                    'payment_date' => $payload['payment_date']
                ]);

            $roomBill = RoomBill::query()
                ->where('id', $booking->roomBill->id)
                ->lockForUpdate()
                ->firstOrFail();

            $newAmountLeft = $roomBill->amount_left - $payload['amount'];

            $newMonthlyBill = max(
                0,
                $roomBill->current_month_bill - $payload['amount']
            );

            $roomBill->update([
                'amount_left' => $newAmountLeft,
                'current_month_bill' => $newMonthlyBill,
                'status' => $newAmountLeft == 0 ? 'paid' : 'partial',
            ]);

            $booking->update([
                'status' => 'active'
            ]);

            return $payment;
        });

        return response()->json([
            'message' => "Payment Record Created."
        ]);
    }

    public function export(PaymentExportRequest $request)
    {
        $payload = $request->validated();

        $payments = RoomBill::query()
            ->select('id', 'booking_record_id', 'payment_plan', 'amount_left', 'current_month_bill', 'status', 'created_at')
            ->with([
                'bookingRecord' => fn ($q) => $q->select('id', 'room_id', 'total'),
                'bookingRecord.room' => fn ($q) => $q->select('id', 'name'),
                'latestPaymentRecord' => fn ($q) => $q->select('id', 'room_bill_id', 'amount', 'payment_date')
            ])
            ->withSum('paymentRecord as total_paid', 'amount')
            ->whereDate('created_at', '>=', $payload['start_date'])
            ->whereDate('created_at', '<=', $payload['end_date'])
            ->when(isset($payload['status']), function ($q) use ($payload) {
                $q->where('status', $payload['status']);
            })
            ->when(isset($payload['room_id']), function ($q) use ($payload) {
                $q->whereRelation('bookingRecord', 'room_id', $payload['room_id']);
            });

        if (!$payments->exists()) {
            abort(404, 'No bookings found for the selected filters.');
        }

        return response()->streamDownload(function () use ($payments) {

            $handle = fopen('php://output', 'w');

            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'ID', 'Booking Record ID', 'Room', 'Amount Paid',
                'Amount Left', 'Current Month Bill', 'Payment Plan',
                'Status', 'Last Payment Date', 'Total Booking',
            ]);

            $payments->chunkById(500, function ($records) use ($handle) {

                foreach ($records as $payment) {
                    fputcsv($handle, [
                        $payment->id,
                        $payment->booking_record_id,
                        $payment->bookingRecord?->room?->name,
                        $payment->total_paid ?? 0,
                        $payment->amount_left,
                        $payment->current_month_bill,
                        $payment->payment_plan,
                        $payment->status,
                        $payment->latestPaymentRecord?->payment_date,
                        $payment->bookingRecord?->total,
                    ]);
                }

            });

            fclose($handle);

        }, 'payments-export-' . now()->format('Y-m-d-H-i-s') . '.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
