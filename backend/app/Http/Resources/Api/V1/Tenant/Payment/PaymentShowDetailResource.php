<?php

namespace App\Http\Resources\Api\V1\Tenant\Payment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentShowDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'booking_information' => [
                'id' => $this->resource['id'],
                'name' => $this->resource->room['name'],
                'room_type' => [
                    'id' => $this->resource->room->roomType['id'],
                    'name' => $this->resource->room->roomType['name']
                ],
                'move_in' => $this->resource['move_in'],
                'move_out' => $this->resource['move_out'],
                'cancellation' => $this->resource->bookingCancellation
                    ? [
                        'reason' => $this->resource->bookingCancellation['reason'],
                        'cancellation_date' => $this->resource->bookingCancellation['created_at'],
                    ]
                    : null,
            ],
            'payment_record' => [
                'id' => $this->resource->roomBill['id'],
                'total_paid' => $this->resource->roomBill['total_paid'],
                'total_left' => $this->resource->roomBill['amount_left'],
                'total' => $this->resource['total'],
                'payment_plan' => $this->resource->roomBill['payment_plan'],
                'status' => $this->resource->roomBill['status']
            ]
        ];
    }
}
