<?php

namespace App\Http\Resources\Api\V1\Tenant\Dashboard;

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
                'active_room' => $this->resource['booking_status']->active,
                'pending_room' => $this->resource['booking_status']->pending,
                'this_month_bill' => $this->resource['this_month_bill']->sum(
                    fn ($item) => $item->roomBill->current_month_bill
                ),
            ],
            'booking_history' => $this->resource['booking_history']->map(fn ($booking) => [
                'id' => $booking->id,
                'move_in' => $booking->move_in,
                'move_out' => $booking->move_out,
                'rental_duration' => $booking->rental_duration,
                'total' => $booking->total,
                'status' => $booking->status,

                'room' => [
                    'id' => $booking->room->id,
                    'name' => $booking->room->name,
                    'price' => $booking->room->price,
                    'floor' => $booking->room->floor,
                    'room_type' => [
                        'id' => $booking->room->roomType->id,
                        'name' => $booking->room->roomType->name,
                    ],
                    'image_paths' => $booking->room->imagePaths->map(fn ($image) => [
                        'id' => $image->id,
                        'image_path' => $image->image_path,
                        'sort_order' => $image->sort_order,
                    ]),
                ],
            ]),

            'payment_history' => [
                'total_amount_paid' => $this->resource['total_amount_paid'],

                'payments' => $this->resource['payment_history']->map(fn ($payment) => [
                    'id' => $payment->id,
                    'room' => [
                        'id' => $payment->room->id,
                        'name' => $payment->room->name,
                    ],
                    'payments' => $payment->paymentRecord->map(fn ($record) => [
                        'id' => $record->id,
                        'amount' => $record->amount,
                        'created_at' => $record->created_at,
                    ]),
                ]),
            ],
        ];
    }
}

