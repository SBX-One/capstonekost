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
use App\Http\Resources\Api\V1\Tenant\Issue\IssueShowListResource;

// Request Imports
use App\Http\Requests\Api\V1\Tenant\Issue\IssueReportRequest;
use App\Http\Requests\Api\V1\Tenant\Issue\IssueShowListRequest;
use App\Http\Requests\Api\V1\Tenant\Issue\IssueShowDetailRequest;
use App\Http\Resources\Api\V1\Tenant\Issue\IssueShowDetailResource;

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

    public function showList(IssueShowListRequest $request) 
    {
        $payload = $request->validated();
        $userId = Auth::id();

        $issues = Issue::query()
            ->select('id', 'user_id', 'title', 'description', 'location_name', 'status', 'created_at')
            ->with([
                'imagePaths' => fn ($q) => $q->select('id', 'issue_id', 'image_path', 'sort_order')
            ])
            ->where('user_id', $userId)
            ->when(isset($payload['filter']), function ($q) use ($payload) {
                $q->where('status', $payload['filter']);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return IssueShowListResource::collection($issues);
    }

    public function showDetail(IssueShowDetailRequest $request)
    {
        $payload = $request->validated();
        $userId = Auth::id();

        $issues = Issue::query()
            ->select('id', 'location_name', 'created_at', 'description', 'status')
            ->with([
                'imagePaths' => fn ($q) => $q->select('id', 'issue_id', 'image_path', 'sort_order'),
                'response' => fn ($q) => $q->select('id', 'issue_id', 'response'),
                'response.imagePaths' => fn ($q) => $q->select('id', 'response_id', 'image_path', 'sort_order')
            ])
            ->where('user_id', $userId)
            ->whereIn('id', $payload['id'])
            ->get();

        if ($issues->isEmpty()) {
            return response()->json([
                'message' => 'No matching issues found.'
            ], 404);
        }

        return IssueShowDetailResource::collection($issues);
    }
}
