<?php

namespace App\Http\Resources\Api\V1\Admin\Room;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomIndexResource extends JsonResource
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
            'name' => $this->resource['name'],
            'room_type' => [
                'id' => $this->resource['room_type_id'],
                'name' => $this->resource->roomType['name']
            ],
            'price' => $this->resource['price'],
            'floor' => $this->resource['floor'],
            'status' => $this->resource['status'],
            'overview' => $this->resource['overview'],
            'description' => $this->resource['description'],
            'rules' => $this->resource['rules'],
            'facilities' => $this->resource->facilities->map(fn ($facility) => [
                'id' => $facility->id,
                'name' => $facility->name,
                'information' => $facility->information,
            ]),
            'utilities' => $this->resource->utilities->map(fn ($utility) => [
                'id' => $utility->id,
                'name' => $utility->name,
                'information' => $utility->information,
            ]),
            'image_paths' => $this->resource->imagePaths->map(fn ($image) => [
                'id' => $image->id,
                'path' => $image->image_path,
                'sort_order' => $image->sort_order
            ])
        ];
    }
}
