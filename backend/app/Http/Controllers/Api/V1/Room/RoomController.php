<?php

namespace App\Http\Controllers\Api\V1\Room;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Resource Imports
use App\Http\Resources\Api\V1\Room\RoomCreateResource;

// Request Imports
use App\Http\Requests\Api\V1\Room\RoomCreateRequest;

// Model Imports
use App\Models\Room;

class RoomController extends Controller
{
    public function create(RoomCreateRequest $request) 
    {
        $room = $request->validated

        
    }
}
