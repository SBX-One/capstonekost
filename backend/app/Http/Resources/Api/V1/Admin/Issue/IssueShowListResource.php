<?php

namespace App\Http\Resources\Api\V1\Admin\Issue;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IssueShowListResource extends JsonResource
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
            'title' => $this->resource['title'],
            'tenant_name' => $this->resource['user']->name,
            'description' => $this->resource['description'],
            'location' => $this->resource['location_name'],
            'created_at' => $this->resource['created_at'],
            'status' => $this->resource['status'],
            'image_path' => $this->resource['imagePaths']->map(fn ($image) => [
                'id' => $image->id,
                'image_path' => $image->image_path,
                'sort_order' => $image->sort_order
            ])
        ];
    }
}
