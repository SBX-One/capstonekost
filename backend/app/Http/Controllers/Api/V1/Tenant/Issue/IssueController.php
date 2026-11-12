<?php

namespace App\Http\Controllers\Api\V1\Tenant\Issue;

use App\Exceptions\Api\V1\Tenant\Issue\IssueCreateFailException;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

// Model Imports
use App\Models\BookingRecord;
use App\Models\Issue;

// Resource Imports
use App\Http\Resources\Api\V1\Tenant\Issue\FetchActiveRoomsResource;

// Request Imports
use App\Http\Requests\Api\V1\Tenant\Issue\IssueReportRequest;

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

        return FetchActiveRoomsResource::collection($rooms);
    }

    public function issueReport(IssueReportRequest $request) 
    {
        $payload = $request->validated();
        $images = $request->file('images', []);
        $userId = Auth::id();

        $uploadedImages = [];

        if (isset($payload['room_id'])) {
            $hasActiveBooking = BookingRecord::query()
                ->where('room_id', $payload['room_id'])
                ->where('user_id', $userId)
                ->where('status', 'active')
                ->exists();

            if (!$hasActiveBooking) {
                return response()->json([
                    'message' => 'You do not have an active booking for this room.'
                ], 422);
            }
        }

        try { 
            $issue = DB::transaction(function () use ($payload, $userId, $images, &$uploadedImages) {
                $issue = Issue::query()
                    ->create([
                        'user_id' => $userId,
                        'room_id' => $payload['room_id'],
                        'location_name' => $payload['location_name'],
                        'title' => $payload['title'],
                        'description' => $payload['description'],
                    ]);

                foreach ($images as $key => $image) {
                    $path = $image->store('issues', 'public');
                    $uploadedImages[] = $path;

                    $issue->imagePaths()->create([
                        'image_path' => $path,
                        'sort_order' => ($key + 1)
                    ]);
                }

                return $issue;
            });
            } catch (\Throwable $e) {
                throw new IssueCreateFailException($uploadedImages, $e);
            }

        return response()->json([
            'message' => 'Issues created.'
        ]);
    }
}
