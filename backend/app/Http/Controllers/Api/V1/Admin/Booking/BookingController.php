<?php

namespace App\Http\Controllers\Api\V1\Admin\Booking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Model Imports
use App\Models\BookingRecord;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Booking\BookingIndexResource;
use App\Http\Resources\Api\V1\Admin\Booking\BookingRejectResource;
use App\Http\Resources\Api\V1\Admin\Booking\BookingApproveResource;

// Request Validation Imports
use App\Http\Requests\Api\V1\Admin\Booking\BookingIndexRequest;
use App\Http\Requests\Api\V1\Admin\Booking\BookingRejectRequest;
use App\Http\Requests\Api\V1\Admin\Booking\BookingApproveRequest;

class BookingController extends Controller
{
    public function index(BookingIndexRequest $request)
    {
        $bookingData = BookingRecord::query()
            ->when($request->filled('status'), function ($query) use ($request) {
                return $query->where('status', $request->input('status'));
            })
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total', 'created_at')
            ->with([
                'room' => fn ($q) => $q->select('id', 'room_type_id', 'name', 'floor', 'price', 'status', 'overview', 'description', 'rules'),
                'room.roomType' => fn ($q) => $q->select('id', 'name'),
                'room.facilities' => fn ($q) => $q->select('facilities.id', 'facilities.name', 'facilities.icon_name'),
                'room.utilities' => fn ($q) => $q->select('utilities.id', 'utilities.name', 'utilities.icon_name'),
                'contact' => fn ($q) => $q->select('id', 'booking_record_id', 'name', 'phone_number', 'email'),
                'user' => fn ($q) => $q->select('id', 'name', 'email')
            ])
            ->get();
        
        return BookingIndexResource::collection($bookingData)
            ->additional([
                'message' => 'Booking records successfully retrieved'
            ]);
    }

    public function reject(BookingRejectRequest $request)
    {
        $id = $request->validated('id');

        $bookings = BookingRecord::whereIn('id', $id)->get();

        foreach ($bookings as $booking) {
            if ($booking->status === 'rejected') {
                throw new \Exception(
                    "Booking ID {$booking->id} is already rejected."
                );
            } elseif ($booking->status !== 'pending') {
                throw new \Exception(
                    "Booking ID {$booking->id} cannot be rejected because its status is '{$booking->status}'. Only pending status bookings can be cancelled."
                );
            }
        }

        $bookings = BookingRecord::whereIn('id', $id)->update([
            'status' => 'rejected'
        ]);

        return (new BookingRejectResource($bookings))
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
