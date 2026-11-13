<?php

namespace App\Http\Controllers\Api\V1\Admin\Issue;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Model Imports
use App\Models\Issue;

// Request Imports
use App\Http\Requests\Api\V1\Admin\Issue\IssueShowListRequest;
use App\Http\Requests\Api\V1\Admin\Issue\IssueShowDetailRequest;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Issue\IssueShowListResource;
use App\Http\Resources\Api\V1\Admin\Issue\IssueShowDetailResource;

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
        
    }
}
