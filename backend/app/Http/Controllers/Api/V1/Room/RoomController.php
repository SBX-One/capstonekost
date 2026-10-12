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
        $roomData = $request->validated();

        $room = Room::query()
                    ->create([
                        'name' => $roomData['name'],
                        'room_type_id' => $roomData['room_type'],
                        'price' => $roomData['price'],
                        'floor' => $roomData['floor'],
                        'description' => $roomData['description'],
                        'rules' => $roomData['rules']
                    ]);
        $room->facilities()->attach($roomData['facilities']);
        $room->utilities()->attach([1, 2]);

        foreach ($request->file('images') as $image) {
            $path = $image->store('images', 'public');

            $room->imagePaths()->create([
                    'image_path' =>  $path
                ]);
        }

        return (new RoomCreateResource([
                'room' => $room
            ]))
            ->response()
            ->setStatusCode(201);
    }
}
