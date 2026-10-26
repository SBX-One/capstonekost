<?php

namespace App\Http\Resources\Api\V1\Tenant\Booking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingShowResource extends JsonResource
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
                'id' => $this->resource['roomType']->id,
                'name' => $this->resource['roomType']->name
            ],
            'price' => $this->resource['price'],
            'status' => $this->resource['status'],
            'floor' => $this->resource['floor'],
            'overview' => $this->resource['overview'],
            'description' => $this->resource['description'],   
            'rules' => $this->resource['rules'],
            'facilities' => $this->resource->facilities->map(fn ($facility) => [
                'id' => $facility['id'],
                'name' => $facility['name'],
                'icon_name' => $facility['icon_name']
            ]),
            'utilities' => $this->resource->utilities->map(fn ($utility) => [
                'id' => $utility['id'],
                'name' => $utility['name'],
                'icon_name' => $utility['icon_name']
            ])
        ];
    }
}
