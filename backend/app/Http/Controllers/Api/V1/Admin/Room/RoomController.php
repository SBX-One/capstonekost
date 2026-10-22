<?php

namespace App\Http\Controllers\Api\V1\Admin\Room;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

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

// Exception Imports
use App\Exceptions\Api\V1\Admin\Room\RoomCreateFailException;

class RoomController extends Controller
{
    public function create(RoomCreateRequest $request) 
    {
        $uploadedImages = [];

        try {
            $room = DB::transaction(function () use ($request, &$uploadedImages) {
                $roomData = $request->validated();

                $room = Room::query()->create([
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

                foreach ($request->file('images', []) as $key => $image) {
                    $path = $image->store('images', 'public');
                    $uploadedImages[] = $path;

                    $room->imagePaths()->create([
                            'image_path' =>  $path,
                            'sort_order' => ($key + 1)
                        ]);
                }

                return $room;
            });
        } catch (\Throwable $e) {
            throw new RoomCreateFailException($uploadedImages, $e);
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
                isset($requestQuery['search']),
                function ($query) use ($requestQuery) {
                    $query->where('name', 'like', '%' . $requestQuery['search'] . '%');
                }
            )
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
                    $query->where('room_type_id', $requestQuery['room_type']);
                }
            )
            ->when(
                isset($requestQuery['floor']),
                function ($query) use ($requestQuery) {
                    $query->where('floor', $requestQuery['floor']);
                }
            )
            ->when(
                isset($requestQuery['facilities']),
                function ($query) use ($requestQuery) {
                    $query->whereHas(
                        'facilities', function ($query) use ($requestQuery) {
                            $query->whereIn('facilities.id', $requestQuery['facilities']);
                        }
                    );
                }
            )
            ->orderByRaw("CASE WHEN status = 'available' THEN 0 ELSE 1 END")
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

        if ($requestPayload['name'] === $room->name) {
            
        }

        $room->update([
            'name' => $requestPayload['name'],
            'room_type_id' => $requestPayload['room_type'],
            'price' => $requestPayload['price'],
            'floor' => $requestPayload['floor'],
            'overview' => $requestPayload['overview'],
            'description' => $requestPayload['description'],
            'rules' => $requestPayload['rules'],
        ]);

        $room->facilities()->detach();
        
        if (filled($requestPayload['facilities'] ?? null)) {
            $room->facilities()->attach($requestPayload['facilities']);
        }

        $deletedImages = $request->validated('deleted_images') ?? [];
        $deletedImages = $room->imagePaths()->whereIn('id', $deletedImages)->get();

        foreach ($deletedImages as $image) {
            Storage::disk('public')->delete($image->image_path);
            $image->delete();
        }

        $existingOrder = $room->imagePaths()->pluck('sort_order')->all();

        foreach ($request->validated('images', []) as $key => $image) {
            if ($image === null) {
                continue;
            }

            $sortOrder = $key + 1;

            if (in_array($sortOrder, $existingOrder, true)) {
                return response()->json([
                    'message' => "Can't fill image with the requested sorting order",
                ], 422);
            }

            $room->imagePaths()->create([
                'image_path' => $image->store('rooms', 'public'),
                'sort_order' => $sortOrder,
            ]);

            $existingOrder[] = $sortOrder;
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
