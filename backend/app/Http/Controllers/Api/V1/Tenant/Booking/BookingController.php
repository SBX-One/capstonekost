<?php

namespace App\Http\Controllers\Api\V1\Tenant\Booking;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Model Imports 
use App\Models\BookingRecord;

class BookingController extends Controller
{
    public function index() 
    {
        $userId = Auth::id();

        $bookingData = BookingRecord::query()
            ->where('user_id', $userId)
            ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total')
            ->with([
                'room' => fn ($q) => $q->select('id', 'room_type_id', 'name', 'price', 'status', 'overview'),
                'room.roomType' => fn ($q) => $q->select('id', 'name'),
                'room.facilities' => fn ($q) => $q->select('facilities.id', 'facilities.name'),
                'room.utilities' => fn ($q) => $q->select('utilities.id', 'utilities.name'),
                'contact' => fn ($q) => $q->select('id', 'booking_record_id', 'name', 'phone_number', 'email'),
                'user' => fn ($q) => $q->select('id', 'name', 'email')
            ])
            ->get();
        
        return response()->json([
            'data' => $bookingData
        ]);
    }
}
