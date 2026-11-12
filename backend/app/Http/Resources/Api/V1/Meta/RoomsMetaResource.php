<?php

namespace App\Http\Resources\Api\V1\Meta;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoomsMetaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
      * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'prices' => [
                [
                    'id' => 'range_1',
                    'min_price' => 1200000,
                    'max_price' => 1699999
                ],
                [   
                    'id' => 'range_2',
                    'min_price' => 1700000,
                    'max_price' => 2199999
                ],
                [
                    'id' => 'range_3',
                    'min_price' => 2200000,
                    'max_price' => 2800000
                ],
            ],
            'floors' => [
                [
                    'id' => 1,
                    'name' => 'Floor 1'
                ],
                [
                    'id' => 2,
                    'name' => 'Floor 2'
                ],
                [
                    'id' => 3,
                    'name' => 'Floor 3'
                ]
            ],
            'room_statuses' => [
                [
                    'id' => 'available',
                    'name' => 'Available'
                ],
                [
                    'id' => 'occupied',
                    'name' => 'Occupied'
                ]
            ],
            'booking_statuses' => [
                [
                    'id' => 'pending',
                    'name' => 'Pending'
                ],
                [
                    'id' => 'cancelled',
                    'name' => 'Cancelled'
                ],
                [
                    'id' => 'rejected',
                    'name' => 'Rejected'
                ],
                [
                    'id' => 'approved',
                    'name' => 'Approved'
                ],
                [
                    'id' => 'active',
                    'name' => 'Active'
                ],
                [
                    'id' => 'completed',
                    'name' => 'Completed'
                ]
            ],
            'tenant_cancel_reasons' => [
                [
                    'id' => 1,
                    'value' => 'Change of Plans'
                ],
                [
                    'id' => 2,
                    'value' => 'Found Another Room' 
                ],
                [
                    'id' => 3,
                    'value' => 'Price Concerns'
                ],
                [
                    'id' => 4, 
                    'value' => 'Incorrect Booking Details'
                ],
                [
                    'id' => 5, 
                    'value' => 'Others'
                ]
            ],
            'admin_reject_reasons' => [
                [
                    'id' => 1,
                    'value' => 'Booking Requirements Not Met'
                ],
                [
                    'id' => 2,
                    'value' => 'Invalid or Incomplete Information' 
                ],
                [
                    'id' => 3,
                    'value' => 'Unable to Verify Tenant Information'
                ],
                [
                    'id' => 4, 
                    'value' => 'Rental Terms not Accepted'
                ],
                [
                    'id' => 5, 
                    'value' => 'Others'
                ]
            ],
            'payment_method' => [
                [
                    'id' => 'cash',
                    'payment' => 'Cash'
                ],
                [
                    'id' => 'transfer',
                    'payment' => 'Bank Transfer'
                ]
            ],
            'room_types' => $this->resource['roomTypes'],
            'facilities' => $this->resource['facilities'],
            'utilities' => $this->resource['utilities'],
            'rooms' => $this->resource['rooms']
        ];
    }
}
