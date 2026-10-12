<?php

namespace App\Http\Controllers\Api\V1\Admin\Room;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Room\RoomCreateResource;
use App\Http\Resources\Api\V1\Admin\Room\RoomIndexResource;
use App\Http\Resources\Api\V1\Admin\Room\RoomShowResource;

// Request Imports
use App\Http\Requests\Api\V1\Admin\Room\RoomCreateRequest;
use App\Http\Requests\Api\V1\Admin\Room\RoomIndexRequest;

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
                        'overview' => $roomData['overview'],
                        'description' => $roomData['description'],
                        'rules' => $roomData['rules']
                    ]);
        $room->facilities()->attach($roomData['facilities']);
        $room->utilities()->attach([1, 2]);

        $sortOrder = 1;
        foreach ($request->file('images') as $image) {
            $path = $image->store('images', 'public');

            $room->imagePaths()->create([
                    'image_path' =>  $path,
                    'sort_order' => $sortOrder
                ]);

            $sortOrder++;
        }

        return (new RoomCreateResource([
                'room' => $room
            ]))
            ->response()
            ->setStatusCode(201);
    }

    public function index(RoomIndexRequest $request) 
    {
        $requestQuery = $request->validated();

        $rooms = Room::query()
            ->when(
                isset($requestQuery['min_price'], $requestQuery['max_price']),
                function ($query) use ($requestQuery) {
                    $query->whereBetween('price', [
                        $requestQuery['min_price'],
                        $requestQuery['max_price'],
                    ]);
                }
            )
            ->when(
                isset($requestQuery['room_type']),
                function ($query) use ($requestQuery) {
                    $query->where('room_type', $requestQuery['room_type']);
                }
            )
            ->when(
                isset($requestQuery['floor']),
                function ($query) use ($requestQuery) {
                    $query->where('floor', $requestQuery['floor']);
                }
            )
            ->when(
                isset($requestQuery['status']),
                function ($query) use ($requestQuery) {
                    $query->where('status', $requestQuery['status']);
                }
            )
            ->paginate(9);

        $rooms->load('roomType');
        $rooms->load('facilities');
        $rooms->load('utilities');
        $rooms->load('imagePaths');

        return RoomIndexResource::collection($rooms)
               ->additional([
                   'message' => 'Successfully fetched data.',
               ]);
    }
    
    public function show(Request $request, string $id)
    {
        $room = Room::findOrFail($id);
        $room->load('roomType');
        $room->load('facilities');
        $room->load('utilities');
        $room->load('imagePaths');

        return (new RoomShowResource($room))
                ->response()
                ->setStatusCode(200);
    }
}
