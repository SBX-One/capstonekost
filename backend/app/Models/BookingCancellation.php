<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['booking_record_id', 'reason'])]
class BookingCancellation extends Model
{
    /**
     * Get the booking record that owns the contact.
     */
    public function bookingRecord()
    {
        return $this->belongsTo(BookingRecord::class, 'booking_record_id');
    }
}
