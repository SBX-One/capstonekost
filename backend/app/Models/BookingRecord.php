<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;


#[Fillable(['room_id', 'user_id', 'move_in', 'move_out', 'rental_duration', 'status', 'total'])]
class BookingRecord extends Model
{
    /** @use HasFactory<\Database\Factories\BookingRecordFactory> */
    use HasFactory, SoftDeletes;

    protected $casts = [
        'move_in' => 'datetime',
        'move_out' => 'datetime',
    ];

    /**
     * Get the room that is booked.
     */
    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    /**
     * Get the user that owns the booking record.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get all contacts for this booking record.
     */
    public function contacts(): HasMany
    {
        return $this->hasMany(BookingContact::class, 'booking_record_id');
    }
}
