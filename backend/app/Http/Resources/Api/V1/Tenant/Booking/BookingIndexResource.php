<?php

namespace App\Http\Resources\Api\V1\Tenant\Booking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingIndexResource extends JsonResource
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
            'user' => [
                'id' => $this->resource->user['id'],
                'name' => $this->resource->user['name'],
                'email' => $this->resource->user['email']
            ],
            'booking_records' => [
                'room_id' => $this->resource['room_id'],
                'move_in' => $this->resource['move_in'],
                'move_out' => $this->resource['move_out'],
                'rental_duration' => $this->resource['rental_duration'],
                'status' => $this->resource['status'],
                'total' => $this->resource['total'],
            ],
            'booked_room' => [
                'id' => $this->resource->room['id'],
                'name' => $this->resource->room['name'],
                'room_type' => [
                    'id' => $this->resource->room['roomType']->id,
                    'name' => $this->resource->room['roomType']->name
                ],
                'floor' => $this->resource->room['floor'],
                'status' => $this->resource->room['status'],
                'price' => $this->resource->room['price'],
                'overview' => $this->resource->room['overview'],
                'description' => $this->resource->room['description'],
                'rules' => $this->resource->room['rules'],
                'facilities' => $this->resource->room->facilities->map(fn ($facility) => [
                    'id' => $facility['id'],
                    'name' => $facility['name'],
                    'icon_name' => $facility['icon_name']
                ]),
                'utilities' => $this->resource->room->utilities->map(fn ($utility) => [
                    'id' => $utility['id'],
                    'name' => $utility['name'],
                    'icon_name' => $utility['icon_name']
                ])
            ],
            'booking_contacts' => [
                'name' => $this->resource->contact['id'],
                'email' => $this->resource->contact['email'],
                'phone' => $this->resource->contact['phone_number'],
            ] 
        ];
    }
}
