<?php

namespace App\Http\Resources\Api\V1\Admin\Booking;

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
                'room_name' => $this->resource->room['name'],
                'move_in' => $this->resource['move_in'],
                'move_out' => $this->resource['move_out'],
                'rental_duration' => $this->resource['rental_duration'],
                'status' => $this->resource['status'],
                'total' => $this->resource['total'],
            ],
            'booking_contacts' => [
                'name' => $this->resource->contact['name'],
                'email' => $this->resource->contact['email'],
                'phone' => $this->resource->contact['phone_number'],
            ] 
        ];
    }
}