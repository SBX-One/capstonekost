<?php

namespace App\Http\Controllers\Api\V1\Admin\Issue;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Model Imports
use App\Models\Issue;

// Request Imports
use App\Http\Requests\Api\V1\Admin\Issue\IssueShowListRequest;

// Resource Imports
use App\Http\Resources\Api\V1\Admin\Issue\IssueShowListResource;

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
        
    }
}
