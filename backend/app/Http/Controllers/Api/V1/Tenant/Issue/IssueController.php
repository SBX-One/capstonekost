<?php

namespace App\Http\Controllers\Api\V1\Tenant\Issue;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

// Model Imports
use App\Models\BookingRecord;

class IssueController extends Controller
{
    public function fetchActiveRooms()
    {
        $userId = Auth::id();

        $rooms = BookingRecord::query()
            ->select('id', 'user_id', 'room_id', 'status')
            ->with([
                'room' => fn ($q) => $q->select('id', 'name')
            ])
            ->where('user_id', $userId)
            ->where('status', 'active')
            ->get();

        
    }
}
