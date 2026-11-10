<?php

namespace App\Http\Resources\Api\V1\Tenant\Payment;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentShowListResource extends JsonResource
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
                    'id' => $this->resource->room['id'],
                    'name' => $this->resource->room['name'],
                    'room_type' => [
                        'id' => $this->resource->room['roomType']->id,
                        'name' => $this->resource->room['roomType']->name
                    ]
                ],
                'move_in' => $this->resource['move_in'],
                'move_out' => $this->resource['move_out'],
                'total' => $this->resource['total']
            ],
            'payment_record' => [
                'due_date' => $this->resource->room_bill['next_due_date'],
                'status' => $this->resource->room_bill['status'],
                'total_paid' => $this->resource['total_paid'],
                'amount_left' => $this->resource->room_bill['amount_left']
            ]
        ];
    }
}
