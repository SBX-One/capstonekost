<?php

namespace App\Http\Controllers\Api\V1\Tenant\Booking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

// Phone Formatter Imports
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;

// Model Imports 
use App\Models\BookingRecord;
use App\Models\Room;
use App\Models\BookingContact;

// Resource Imports 
use App\Http\Resources\Api\V1\Tenant\Booking\BookingIndexResource;
use App\Http\Resources\Api\V1\Tenant\Booking\BookingShowResource;
use App\Http\Resources\Api\V1\Tenant\Booking\BookingBookResource;

// Request Imports
use App\Http\Requests\Api\V1\Tenant\Booking\BookingShowRequest;
use App\Http\Requests\Api\V1\Tenant\Booking\BookingBookRequest;

class BookingController extends Controller
{
    public function index() 
    {
        $userId = Auth::id();

        $bookingData = BookingRecord::query()
            ->where('user_id', $userId)
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

    public function show(BookingShowRequest $request, string $id)
    {
        $room = Room::query()
            ->with([
                'roomType' => fn ($q) => $q->select('id', 'name'),
                'facilities' => fn ($q) => $q->select('facilities.id', 'facilities.name', 'facilities.icon_name'),
                'utilities' => fn ($q) => $q->select('utilities.id', 'utilities.name', 'utilities.icon_name'),
            ])
            ->findOrFail($id);

        return (new BookingShowResource($room))
            ->response()
            ->setStatusCode(200);
    }

    public function book(BookingBookRequest $request, string $id)
    {
        $bookingRecord = DB::transaction(function () use ($request, $id) {
            $room = Room::findOrFail($id);
            $userId = Auth::id();

            $booking = $request->validated();

            $existingBookings = BookingRecord::query()
                ->where('room_id', $id)
                ->whereIn('status', ['pending', 'active'])
                ->where('move_in', '<', $booking['move_out'])
                ->where('move_out', '>', $booking['move_in'])
                ->exists();

            if ($existingBookings) {
                throw new \Exception(
                    'This room is already booked for the selected dates.'
                );
            }

            $months = Carbon::parse($booking['move_in'])
                ->diffInDays(Carbon::parse($booking['move_out'])) / 30;

            if ($months != $booking['rental_duration']) {
                throw new \Exception(
                    'Move in and move out dates are not equal to '
                    . $booking['rental_duration']
                    . ' month(s) rental duration.'
                );
            }

            $phoneNumberUtil = PhoneNumberUtil::getInstance();
            $number = $phoneNumberUtil->parse($booking['phone'], 'ID');

            if (!$phoneNumberUtil->isValidNumber($number)) {
                throw new \InvalidArgumentException(
                    'Invalid phone number format.'
                );
            }

            $phone = $phoneNumberUtil->format(
                $number,
                PhoneNumberFormat::E164
            );

            $bookingRecord = BookingRecord::query()->create([
                'room_id' => $id,
                'user_id' => $userId,
                'move_in' => $booking['move_in'],
                'move_out' => $booking['move_out'],
                'rental_duration' => $booking['rental_duration'],
                'total' => $room->price * $booking['rental_duration'],
            ]);

            BookingContact::query()->create([
                'booking_record_id' => $bookingRecord->id,
                'user_id' => $userId,
                'name' => $booking['name'],
                'email' => $booking['email'],
                'phone_number' => $phone,
            ]);

            return $bookingRecord->refresh();
        });

        return (new BookingBookResource($bookingRecord))
            ->response()
            ->setStatusCode(201);
    }
}
