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
            'booking_record' => [
                'id' => $this->resource['id'],
                'name' => $this->resource->room['id'],
                'move_in' => $this->resource['move_in'],
                'move_out' => $this->resource['move_out'],
                'rental_duration' => $this->resource['rental_duration'],
                'status' => $this->resource['status'],
                'total' => $this->resource['total']
            ],
            'payment_record' => [
                'id' => $this->resource->roomBill['id'],
                'payment_plan' => $this->resource->roomBill['payment_plan'],
                'status' => $this->resource->roomBill['status']
            ]
        ];
    }
}
