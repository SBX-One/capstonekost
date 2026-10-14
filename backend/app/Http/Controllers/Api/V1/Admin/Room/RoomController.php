<?php

namespace App\Http\Controllers\Api\V1\Admin\Room;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Room\RoomCreateResource;
use App\Http\Resources\Api\V1\Admin\Room\RoomIndexResource;
use App\Http\Resources\Api\V1\Admin\Room\RoomShowResource;
use App\Http\Resources\Api\V1\Admin\Room\RoomUpdateResource;
use App\Http\Resources\Api\V1\Admin\Room\RoomDeleteResource;

// Request Imports
use App\Http\Requests\Api\V1\Admin\Room\RoomCreateRequest;
use App\Http\Requests\Api\V1\Admin\Room\RoomIndexRequest;
use App\Http\Requests\Api\V1\Admin\Room\RoomUpdateRequest;
use App\Http\Requests\Api\V1\Admin\Room\RoomDeleteRequest;

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

    public function update(RoomUpdateRequest $request, string $id)
    {
        $requestPayload = $request->validated();

        $room = Room::findOrFail($id);

        $room->update([
            'name' => $requestPayload['name'],
            'room_type_id' => $requestPayload['room_type'],
            'price' => $requestPayload['price'],
            'floor' => $requestPayload['floor'],
            'overview' => $requestPayload['overview'],
            'description' => $requestPayload['description'],
            'rules' => $requestPayload['rules'],
        ]);

        if (filled($requestPayload['facilities'] ?? null)) {
            $room->facilities()->detach();
            $room->facilities()->attach($requestPayload['facilities']);
        }

        $room->load('imagePaths');

        foreach ($room->imagePaths as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        $room->imagePaths()->delete();

        if (filled($request->file('images'))) {
            $sortOrder = 1;
            foreach ($request->file('images') as $image) {
                $path = $image->store('images', 'public');

                $room->imagePaths()->create([
                        'image_path' =>  $path,
                        'sort_order' => $sortOrder
                    ]);

                $sortOrder++;
            }
        }

        return (new RoomUpdateResource([
                'room' => $room
            ]))
            ->response()
            ->setStatusCode(201);
    }

    public function delete(RoomDeleteRequest $request)
    {
        $ids = $request->validated('id');

        foreach ($ids as $id) {
            $room = Room::findOrFail($id);
            $room->delete();
        }

        return (new RoomDeleteResource([
                'toReturn' => null
            ]))
            ->response()
            ->setStatusCode(200);
    }
}
