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
            'room_types' => $this->resource['roomTypes'],
            'facilities' => $this->resource['facilities'],
            'utilities' => $this->resource['utilities']
        ];
    }
}
