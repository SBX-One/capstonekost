<?php

namespace App\Http\Resources\Api\V1\Admin\Dashboard;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardIndexResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'metrics' => [
                'total_rooms' => $this->resource['room_overview']->total,
                'active_bookings' => $this->resource['booking_status']->active,
                'payments_this_month' => $this->resource['payment_this_month']
            ],
            'room_occupancy' => [
                'total' => $this->resource['room_overview']->total,
                'occupied' => $this->resource['room_overview']->occupied,
                'available' => $this->resource['room_overview']->available
            ],
            'booking_status_overview' => [
                'pending' => $this->resource['booking_status']->pending,
                'cancelled' => $this->resource['booking_status']->cancelled,
                'rejected' => $this->resource['booking_status']->rejected,
                'approved' => $this->resource['booking_status']->approved,
                'active' => $this->resource['booking_status']->active,
                'completed' => $this->resource['booking_status']->completed
            ],
            'recent_bookings' => $this->resource['recent_bookings']->map(fn ($booking) => [
                'id' => $booking->id,
                'user' => [
                    'id' => $booking->user->id,
                    'name' => $booking->user->name,
                    'email' => $booking->user->email
                ],
                'booking_records' => [
                    'room_id' => $booking->room->id, 
                    'room_name' => $booking->room->name,
                    'move_in' => $booking->move_in,
                    'move_out' => $booking->move_out,
                    'rental_duration' => $booking->rental_duration,
                    'status' => $booking->status,
                    'total' => $booking->total,
                ],
                'booking_contacts' => [
                    'name' => $booking->contact->name,
                    'email' => $booking->contact->email,
                    'phone' => $booking->contact->phone_number
                ]
            ])
        ];
    }
}
