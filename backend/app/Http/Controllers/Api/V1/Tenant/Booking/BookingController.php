<?php

namespace App\Http\Controllers\Api\V1\Tenant\Booking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Model Imports 
use App\Models\BookingRecord;

// Resource Imports 
use App\Http\Resources\Api\V1\Tenant\Booking\BookingIndexResource;

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
}
