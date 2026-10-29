<?php

namespace App\Http\Controllers\Api\V1\Admin\Booking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Model Imports
use App\Models\BookingRecord;
use App\Models\BookingReject;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Booking\BookingIndexResource;
use App\Http\Resources\Api\V1\Admin\Booking\BookingRejectResource;
use App\Http\Resources\Api\V1\Admin\Booking\BookingApproveResource;
use App\Http\Resources\Api\V1\Admin\Booking\BookingShowResource;

// Request Validation Imports
use App\Http\Requests\Api\V1\Admin\Booking\BookingIndexRequest;
use App\Http\Requests\Api\V1\Admin\Booking\BookingRejectRequest;
use App\Http\Requests\Api\V1\Admin\Booking\BookingApproveRequest;

class BookingController extends Controller
{
    public function index(BookingIndexRequest $request)
    {
        $bookingData = BookingRecord::query()
            ->when($request->filled('search'), function ($query) use ($request) {
                return $query->whereHas('room', function ($query) use ($request) {
                    $query->where(
                        'name', 'like', '%' . $request->validated('search') . '%'
                    );
                });
            })
            ->when($request->filled('status'), function ($query) use ($request) {
                return $query->where('status', $request->validated('status'));
            })
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total', 'created_at')
            ->with([
                'room' => fn ($q) => $q->select('id', 'name'),
                'contact' => fn ($q) => $q->select('id', 'booking_record_id', 'name', 'phone_number', 'email'),
                'user' => fn ($q) => $q->select('id', 'name', 'email')
            ])
            ->get();
        
        return BookingIndexResource::collection($bookingData)
            ->additional([
                'message' => 'Booking records successfully retrieved'
            ]);
    }

    public function show(Request $request, string $id)
    {
        $roomDetailData = BookingRecord::query()
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total', 'created_at')
            ->with([
                'room' => fn ($q) => $q->select('id', 'name', 'room_type_id', 'price', 'floor'),
                'room.roomType' => fn ($q) => $q->select('id', 'name'),
                'room.facilities' => fn ($q) => $q->select('facilities.id', 'facilities.name', 'facilities.icon_name'),
                'room.utilities' => fn ($q) => $q->select('utilities.id', 'utilities.name', 'utilities.icon_name'),
                'contact' => fn ($q) => $q->select('id', 'booking_record_id', 'name', 'phone_number', 'email'),
                'bookingCancellation' => fn ($q) => $q->select('id', 'booking_record_id', 'reason'),
                'roomBill' => fn ($q) => $q->select('id', 'booking_record_id', 'last_payment_id', 'status', 'next_due_date'),
                'roomBill.paymentRecord' => fn ($q) => $q->select('id', 'booking_record_id', 'amount', 'created_at')
            ])
            ->findOrFail($id);

        return (new BookingShowResource($roomDetailData));
    }

    public function reject(BookingRejectRequest $request)
    {
        $result = DB::transaction(function () use ($request) {
            $ids = $request->validated('id');
            $reasons = $request->validated('reason');

            $bookings = BookingRecord::whereIn('id', $ids)->get();

            foreach ($bookings as $booking) {
                if ($booking->status === 'rejected') {
                    throw new \Exception(
                        "Booking ID {$booking->id} is already rejected."
                    );
                } elseif ($booking->status !== 'pending') {
                    throw new \Exception(
                        "Booking ID {$booking->id} cannot be rejected because its status is '{$booking->status}'. Only pending status bookings can be rejected."
                    );
                }
            }

            BookingRecord::whereIn('id', $ids)->update([
                'status' => 'rejected',
            ]);

            foreach ($ids as $id) {
                BookingReject::create([
                    'booking_record_id' => $id,
                    'reason' => $reasons[$id],
                ]);
            }

            return BookingRecord::whereIn('id', $ids)->get();
        });

        return BookingRejectResource::collection($result)
            ->response()
            ->setStatusCode(200);
    }

    public function approve(BookingApproveRequest $request) 
    {
        $id = $request->validated('id');

        $bookings = BookingRecord::whereIn('id', $id)->get();

        foreach ($bookings as $booking) {
            if ($booking->status === 'approved') {
                throw new \Exception(
                    "Booking ID {$booking->id} is already approved."
                );
            } elseif ($booking->status !== 'pending') {
                throw new \Exception(
                    "Booking ID {$booking->id} cannot be approved because its status is '{$booking->status}'. Only pending status bookings can be approved."
                );
            }
        }

        $bookings = BookingRecord::whereIn('id', $id)->update([
            'status' => 'approved'
        ]);

        return (new BookingApproveResource($bookings))
                ->response()
                ->setStatusCode(200);
    }
}
