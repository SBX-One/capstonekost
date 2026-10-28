<?php

namespace App\Http\Resources\Api\V1\Admin\Booking;

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
            'booking_record' => [
                'id' => $this->resource['id'],
                'room_id' => $this->resource['room_id'],
                'user_id' => $this->resource['user_id'],
                'move_in' => $this->resource['move_in'],
                'move_out' => $this->resource['move_out'],
                'rental_duration' => $this->resource['rental_duration'],
                'total' => $this->resource['total'],
                'status' => $this->resource['status']
            ],
            'room' => [
                'id' => $this->resource->room['id'],
                'name' => $this->resource->room['name'],
                'room_type' => [
                    'id' => $this->resource->room->roomType->id,
                    'name' => $this->resource->room->roomType->name
                ],
                'price' => $this->resource->room['price'],
                'floor' => $this->resource->room['floor'],
                'facilities' => $this->resource->room->facilities->map(fn ($facility) => [
                    'id' => $facility->id,
                    'name' => $facility->name,
                    'icon_name' => $facility->icon_name
                ]),
                'utilities' => $this->resource->room->utilities->map(fn ($utility) => [
                    'id' => $utility->id,
                    'name' => $utility->name,
                    'icon_name' => $utility->icon_name
                ])
            ],
            'contacts' => [
                'name' => $this->resource->contact['name'],
                'phone' => $this->resource->contact['phone_number'],
                'email' => $this->resource->contact['email']
            ],
            'cancellation_reason' => $this->whenLoaded(
                'bookingCancellation',
                fn ($cancellation) => [
                    'id' => $cancellation->id,
                    'reason' => $cancellation->reason,
                ]
            ),
            'payment_overview' => $this->whenLoaded(
                'roomBill',
                fn ($bill) => [
                    'latest_payment' => $bill->paymentRecord->created_at,
                    'status' => $bill->status,
                    'next_due_date' => $bill->next_due_date,
                    'amount' => $bill->paymentRecord->amount
                ]
            )
        ];
    }
}
