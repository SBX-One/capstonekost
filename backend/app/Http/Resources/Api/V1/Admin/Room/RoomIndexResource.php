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
            'message' => 'Successfully fetched data.',
            'data' => [
                $this->resource['rooms']
            ],
            'meta' => [
                'current_page' => $this->resource['current_page'],
                'per_page' => $this->resource['per_page'],
                'total' => $this->resource['total'],
                'last_page' => $this->resource['last_page']
            ]
        ];
    }
}
