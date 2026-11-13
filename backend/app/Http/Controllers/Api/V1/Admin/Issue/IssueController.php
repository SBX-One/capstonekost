<?php

namespace App\Http\Controllers\Api\V1\Admin\Issue;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

// Model Imports
use App\Models\Issue;
use App\Models\IssueResponse;

// Request Imports
use App\Http\Requests\Api\V1\Admin\Issue\IssueShowListRequest;
use App\Http\Requests\Api\V1\Admin\Issue\IssueShowDetailRequest;
use App\Http\Requests\Api\V1\Admin\Issue\IssueHandleRequest;
use App\Http\Requests\Api\V1\Admin\Issue\IssueResolveRequest;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Issue\IssueShowListResource;
use App\Http\Resources\Api\V1\Admin\Issue\IssueShowDetailResource;

// Exception Imports
use Illuminate\Validation\ValidationException;
use App\Exceptions\Api\V1\Admin\Issue\IssueHandlingFailException;
use App\Exceptions\Api\V1\Admin\Issue\IssueResolveFailException;

class IssueController extends Controller
{
    public function showList(IssueShowListRequest $request)
    {
        $payload = $request->validated();

        $issues = Issue::query()
            ->select('id', 'user_id', 'title', 'description', 'location_name', 'created_at', 'status')
            ->with([
                'imagePaths' => fn ($q) => $q->select('id', 'issue_id', 'image_path', 'sort_order'),
                'user' => fn ($q) => $q->select('id', 'name', 'email', 'phone')
            ])
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

        $issues = Issue::query()
            ->select('id', 'user_id', 'location_name', 'created_at', 'description', 'status')
            ->with([
                'user' => fn ($q) => $q->select('id', 'name', 'email', 'phone'),
                'imagePaths' => fn ($q) => $q->select('id', 'issue_id', 'image_path', 'sort_order'),
                'response' => fn ($q) => $q->select('id', 'issue_id', 'response'),
                'response.imagePaths' => fn ($q) => $q->select('id', 'response_id', 'image_path', 'sort_order')
            ])
            ->whereIn('id', $payload['id'])
            ->get();

        if ($issues->isEmpty()) {
            return response()->json([
                'message' => 'No matching issues found.'
            ], 404);
        }

        return IssueShowDetailResource::collection($issues);
    }

    public function issueHandle(IssueHandleRequest $request)  
    {
        $payload = $request->validated();
        $images = $request->file('images', []);

        $uploadedImages = [];

        $issue = Issue::query()
            ->findOrFail($payload['issue_id']);
        
        if ($issue->status !== 'open') {
            throw ValidationException::withMessages([
                'issue_id' => ['This issue is no longer open.']
            ]);
        }

        try {
            $response = DB::transaction(function () use ($payload, $images, $issue, &$uploadedImages) {
                $response = IssueResponse::query()
                    ->create([
                        'issue_id' => $payload['issue_id'],
                        'response' => $payload['description']
                    ]);

                foreach ($images as $key => $image) {
                    $path = $image->store('responses', 'public');
                    $uploadedImages[] = $path;

                    $response->imagePaths()->create([
                        'image_path' => $path,
                        'sort_order' => ($key + 1)
                    ]);
                }

                $issue->update([
                    'status' => 'progress'
                ]);

                return $response;
            });
        } catch (\Throwable $e) {
            throw new IssueHandlingFailException($uploadedImages, $e);
        }

        return response()->json([
            'message' => 'Handling response created.'
        ]);
    }

    public function issueResolve(IssueResolveRequest $request) 
    {
        $payload = $request->validated();
        $images = $request->file('images', []);

        $uploadedImages = [];
        $imagesToDelete = [];

        $issue = Issue::query()
            ->findOrFail($payload['issue_id']);

        if ($issue->status != 'progress') {
            throw ValidationException::withMessages([
                'issue_id' => ['This issue status is not in progress.']
            ]);
        }

        if ($issue->response->id != $payload['response_id']) {
            throw ValidationException::withMessages([
                'response_id' => ['This response id is not valid for the inputted issue id.']
            ]);
        }

        if (isset($payload['deleted_images'])) {
            $imageIds = $issue->response['imagePaths']->pluck('id');

            foreach ($payload['deleted_images'] as $deletedId) {
                if (!$imageIds->contains($deletedId)) {
                    throw ValidationException::withMessages([
                        'deleted_images' => ['One or more deleted image IDs do not belong to this response.']
                    ]);
                }
            }
        }

        try {
            $response = DB::transaction(function () use (
                $payload,
                $images,
                $issue,
                &$imagesToDelete, 
                &$uploadedImages
            ) {
                $response = IssueResponse::query()
                    ->findOrFail($payload['response_id']);
                    
                $response->update([
                    'response' => $payload['description']
                ]);
                
                $issue->update([
                    'status' => 'resolved'
                ]);

                $imagesToDelete = $payload['deleted_images'] ?? [];
                
                $imagesToDelete = $response->imagePaths()->whereIn('id', $imagesToDelete)->get();

                $imagesToDelete->each->delete();

                $existingOrder = $response->imagePaths()->pluck('sort_order')->all();

                foreach ($images as $key => $image) {
                    if ($image === null) {
                        continue;
                    }

                    $sortOrder = $key + 1;

                    if (in_array($sortOrder, $existingOrder, true)) {
                        throw ValidationException::withMessages([
                            'images' => ["Can't fill image with the requested sorting order."],
                        ]);
                    }

                    $image_path = $image->store('responses', 'public');

                    $uploadedImages[] = $image_path;

                    $response->imagePaths()->create([
                        'image_path' => $image_path,
                        'sort_order' => $sortOrder,
                    ]);

                    $existingOrder[] = $sortOrder;
                }

                return $response;
            });
        } catch (\Throwable $e) {
            throw new IssueResolveFailException($uploadedImages, $e);
        }

        foreach ($imagesToDelete as $image) {
            Storage::disk('public')->delete($image->image_path);
        }

        return response()->json([
            'message' => 'Issues resolved.'
        ]);
    }
}
