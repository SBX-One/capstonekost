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
            'filter' => [
                'prices' => [
                    [
                        'min_price' => 1200000,
                        'max_price' => 1699999
                    ],
                    [
                        'min_price' => 1700000,
                        'max_price' => 2199999
                    ],
                    [
                        'min_price' => 2200000,
                        'max_price' => 2800000
                    ],
                ],
                'floors' => [
                    [
                        'floor' => '1'
                    ],
                    [
                        'floor' => '2'
                    ],
                    [
                        'floor' => '3'
                    ]
                ],
                'room_types' => $this->resource->roomTypes->map(fn ($roomType) => [
                    'id' => $roomType->id,
                    'name' => $roomType->name
                ])
            ],
            'facilities' => $this->resource->facilities->map(fn ($facility) => [
                'id' => $facility->id,
                'icon_name' => $facility->iconName,
                'name' => $facility->name,
                'information' => $facility->information,
            ]),
            'utilities' => $this->resource->utilities->map(fn ($utility) => [
                'id' => $utility->id,
                'name' => $utility->name,
                'icon_name' => $utility->iconName,
                'information' => $utility->information,
            ]),
        ];
    }
}
