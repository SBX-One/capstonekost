<?php

namespace App\Http\Controllers\Api\V1\Tenant\Room;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Request Imports
use App\Http\Requests\Api\V1\Tenant\Room\RoomIndexRequest;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Room\RoomIndexResource;
use App\Http\Resources\Api\V1\Tenant\Room\RoomShowResource;

// Model Imports
use App\Models\Room;

class RoomController extends Controller
{
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

    public function show (Request $request, string $id)
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
