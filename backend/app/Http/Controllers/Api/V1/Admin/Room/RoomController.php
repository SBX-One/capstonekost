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
use App\Http\Resources\Api\V1\Admin\Room\RoomShowDetailResource;

// Request Imports
use App\Http\Requests\Api\V1\Admin\Room\RoomCreateRequest;
use App\Http\Requests\Api\V1\Admin\Room\RoomIndexRequest;
use App\Http\Requests\Api\V1\Admin\Room\RoomUpdateRequest;
use App\Http\Requests\Api\V1\Admin\Room\RoomDeleteRequest;
use App\Http\Requests\Api\V1\Admin\Room\RoomExportRequest;

// Model Imports
use App\Models\Room;

// Exception Imports
use App\Exceptions\Api\V1\Admin\Room\RoomCreateFailException;
use App\Exceptions\Api\V1\Admin\Room\RoomUpdateFailException;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;

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
                    $path = $image->store('rooms', 'public');
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
        $imagesToDelete = [];
        $uploadedImages = [];
        
        $requestPayload = $request->validated();

        try {
            $room = DB::transaction(function () use (
                $requestPayload, 
                $id, 
                &$imagesToDelete, 
                &$uploadedImages
            ) {
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

                $room->facilities()->detach();
                
                if (filled($requestPayload['facilities'] ?? null)) {
                    $room->facilities()->attach($requestPayload['facilities']);
                }

                $imagesToDelete = $requestPayload['deleted_images'] ?? [];
                $imagesToDelete = $room->imagePaths()->whereIn('id', $imagesToDelete)->get();

                $imagesToDelete->each->delete();

                $existingOrder = $room->imagePaths()->pluck('sort_order')->all();

                foreach ($requestPayload['images'] ?? [] as $key => $image) {
                    if ($image === null) {
                        continue;
                    }

                    $sortOrder = $key + 1;

                    if (in_array($sortOrder, $existingOrder, true)) {
                        throw ValidationException::withMessages([
                            'images' => ["Can't fill image with the requested sorting order."],
                        ]);
                    }

                    $image_path = $image->store('rooms', 'public');

                    $uploadedImages[] = $image_path;

                    $room->imagePaths()->create([
                        'image_path' => $image_path,
                        'sort_order' => $sortOrder,
                    ]);

                    $existingOrder[] = $sortOrder;
                }

                return $room;
            });
        } catch (\Throwable $e) {
            throw new RoomUpdateFailException($uploadedImages, $e);
        }

        foreach ($imagesToDelete as $image) {
            Storage::disk('public')->delete($image->image_path);
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

    public function detail (Request $request, string $id)
    {
        $room = Room::query()
            ->select('id', 'name', 'room_type_id', 'price', 'floor', 'status', 'overview', 'description', 'rules')
            ->with([
                'facilities' => fn ($q) => $q->select('facilities.id', 'facilities.name', 'facilities.icon_name'),
                'utilities' => fn ($q) => $q->select('utilities.id', 'utilities.name', 'utilities.icon_name'),
                'roomType' => fn ($q) => $q->select('id', 'name'),
                'imagePaths' => fn ($q) => $q->select('id', 'room_id', 'image_path', 'sort_order'),
                'bookingRecords' => fn ($q) => $q
                    ->select('id', 'room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total')
                    ->whereDate('move_in', '<=', today())
                    ->whereDate('move_out', '>=', today()),
                'bookingRecords.roomBill' => fn ($q) => $q->select('id', 'booking_record_id', 'last_payment_id', 'status', 'next_due_date'),
                'bookingRecords.contact' => fn ($q) => $q->select('id', 'booking_record_id', 'user_id', 'name', 'phone_number','email') 
            ])
            ->findOrFail($id);

        return (new RoomShowDetailResource($room));
    }

    public function export(RoomExportRequest $request)
    {
        $payload = $request->validated();

        $rooms = Room::query()
            ->select('id', 'name', 'room_type_id', 'price', 'floor', 'status', 'overview', 'description', 'rules')
            ->with([
                'facilities' => fn ($q) => $q->select('facilities.id', 'facilities.name', 'facilities.information'),
                'utilities' => fn ($q) => $q->select('utilities.id', 'utilities.name', 'utilities.information'),
                'roomType' => fn ($q) => $q->select('id', 'name')
            ])
            ->when(isset($payload['room_status']), function ($q) use ($payload) {
                $q->where('status', $payload['room_status']);
            })
            ->when(isset($payload['room_type']), function ($q) use ($payload) {
                $q->where('room_type_id', $payload['room_type']);
            })
            ->when(isset($payload['floors']), function ($q) use ($payload) {
                $q->where('floor', $payload['floors']);
            });

        if (!$rooms->exists()) {
            abort(404, 'No rooms found for the selected filters.');
        }
            
        return response()->streamDownload(function () use ($rooms) {

            $handle = fopen('php://output', 'w');

            fwrite($handle, "\xEF\xBB\xBF");

            fputcsv($handle, [
                'ID',
                'Name',
                'Type',
                'Floor',
                'Price',
                'Status',
                'Overview',
                'Description',
                'Rules',
                'Utilities',
                'Facilities',
            ]);

            $rooms->chunkById(500, function ($records) use ($handle) {

                foreach ($records as $room) {

                    fputcsv($handle, [
                        $room->id,
                        $room->name,
                        $room->roomType?->name,
                        $room->floor,
                        $room->price,
                        $room->status,
                        $room->overview,
                        $room->description,
                        $room->rules,

                        $room->utilities->pluck('name')->implode(', '),
                        $room->facilities->pluck('name')->implode(', '),
                    ]);

                }

            });

            fclose($handle);

        }, 'rooms-export-' . now()->format('Y-m-d-H-i-s') . '.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
