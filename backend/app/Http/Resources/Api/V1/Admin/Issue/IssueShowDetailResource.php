<?php

namespace App\Http\Resources\Api\V1\Admin\Issue;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IssueShowDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'tenant_information' => [
                'name' => $this->resource['user']->name,
                'email' => $this->resource['user']->email,
                'phone' => $this->resource['user']->phone
            ],
            'issues_information' => [
                'location' => $this->resource['location_name'],
                'created_at' => $this->resource['created_at'],
                'description' => $this->resource['description'],
                'status' => $this->resource['status'],
                'image_paths' => $this->resource['imagePaths']->map(fn ($image) => [
                    'id' => $image->id,
                    'image_path' => $image->image_path,
                    'sort_order' => $image->sort_order
                ]),
            ],
            'admin_response' => $this->resource['response'] !== null
                ? [
                    'id' => $this->resource['response']->id,
                    'response' => $this->resource['response']->response,
                    'image_paths' => $this->resource['response']->imagePaths->map(fn ($image) => [
                        'id' => $image->id,
                        'image_path' => $image->image_path,
                        'sort_order' => $image->sort_order
                    ])
                ]
                : null,
        ];
    }
}
