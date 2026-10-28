<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class PaymentRecord extends Model
{
    public function bookingRecord(): BelongsTo
    {
        return $this->belongsTo(BookingRecord::class, 'booking_record_id');
    }

    public function roomBill(): HasOne
    {
        return $this->hasOne(RoomBill::class, 'last_payment_id');
    }
}
