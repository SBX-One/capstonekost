<?php

namespace App\Http\Resources\Api\V1\Admin\Booking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingApproveResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'message' => "Booking(s) status set to 'approved' successfully" 
        ];
    }
}
