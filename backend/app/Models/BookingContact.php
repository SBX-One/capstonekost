<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


#[Fillable(['booking_record_id', 'user_id', 'name', 'phone_number', 'email'])]
class BookingContact extends Model
{
    /** @use HasFactory<\Database\Factories\BookingContactFactory> */
    use HasFactory;

    /**
     * Get the booking record that owns the contact.
     */
    public function bookingRecord()
    {
        return $this->belongsTo(BookingRecord::class, 'booking_record_id');
    }

    /**
     * Get the user linked to the contact.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
