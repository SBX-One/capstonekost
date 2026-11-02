<?php

namespace App\Http\Resources\Api\V1\Admin\Room;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomShowDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'room' => [
                'id' => $this->resource['id'],
                'name' => $this->resource['name'],
                'room_type' => [
                    'id' => $this->resource->roomType['id'],
                    'name' => $this->resource->roomType['name']
                ],
                'price' => $this->resource['price'],
                'status' => $this->resource['status'],
                'floor' => $this->resource['floor'],
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
            ],
            'booking_record' => [
                $this->resource->bookingRecords->map(fn ($bookingRecord) => [
                    'tenant_information' => [
                        'id' => $bookingRecord->id,
                        'room_id' => $bookingRecord->room_id,
                        'user_id' => $bookingRecord->user_id,
                        'name' => $bookingRecord->contact->name,
                        'phone' => $bookingRecord->contact->phone_number,
                        'email' => $bookingRecord->contact->email,
                        'move_in' => $bookingRecord->move_in,
                        'move_out' => $bookingRecord->move_out,
                    ],
                    'rental_payment' => [
                        'rental_duration' => $bookingRecord->rental_duration,
                        'payment_status' => $bookingRecord->roomBill->status,
                        'next_due_date' => $bookingRecord->roomBill->next_due_date
                    ]
                ])  
            ]
        ];
    }
}
