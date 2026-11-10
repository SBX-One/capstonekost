<?php

namespace App\Http\Resources\Api\V1\Admin\Payment;

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
            'id' => $this->resource['id'],
            'booking_record' => [
                'room' => [
                    'id' => $this->resource->bookingRecord['id'],
                    'name' => $this->resource->bookingRecord['room']->name,
                    'room_type' => [
                        'id' => $this->resource->bookingRecord['room']->roomType['id'],
                        'name' => $this->resource->bookingRecord['room']->roomType['name']
                    ],
                    'contact' => [
                        'name' => $this->resource->bookingRecord['contact']->name
                    ]
                ],
                'move_in' => $this->resource->bookingRecord['move_in'],
                'move_out' => $this->resource->bookingRecord['move_out'],
            ],
            'payment_record' => [
                'payment_date' => $this->resource['payment_date'],
                'payment_method' => $this->resource['method'],
                'payment_plan' => $this->resource->roomBill['payment_plan'],
                'payment_notes' => $this->resource['note'],
                'amount' => $this->resource['amount']
            ]
        ];
    }
}
