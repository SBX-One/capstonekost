<?php

namespace App\Http\Resources\Api\V1\Tenant\Booking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

use App\Http\Resources\Api\V1\Tenant\Booking\BookingIndexRecentResource;
use App\Http\Resources\Api\V1\Tenant\Booking\BookingIndexHistoryResource;

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
            'recent_booking' => $this->resource['recent_booking']
                ? new BookingIndexRecentResource($this->resource['recent_booking'])
                : null,

            'history_bookings' => [
                'data' => BookingIndexHistoryResource::collection(
                    $this->resource['history_bookings']
                ),
                'links' => [
                    'first' => $this->resource['history_bookings']->url(1),
                    'last' => $this->resource['history_bookings']->url(
                        $this->resource['history_bookings']->lastPage()
                    ),
                    'prev' => $this->resource['history_bookings']->previousPageUrl(),
                    'next' => $this->resource['history_bookings']->nextPageUrl(),
                ],
                'meta' => [
                    'current_page' => $this->resource['history_bookings']->currentPage(),
                    'from' => $this->resource['history_bookings']->firstItem(),
                    'last_page' => $this->resource['history_bookings']->lastPage(),
                    'links' => $this->resource['history_bookings']->linkCollection()->toArray(),
                    'path' =>  $this->resource['history_bookings']->path(),
                    'per_page' => $this->resource['history_bookings']->perPage(),
                    'to' => $this->resource['history_bookings']->lastItem(),
                    'total' => $this->resource['history_bookings']->total(),
                ],
            ],
        ];
    }
}
