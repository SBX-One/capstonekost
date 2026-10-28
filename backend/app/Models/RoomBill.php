<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RoomBill extends Model
{
    public function bookingRecord(): BelongsTo
    {
        return $this->belongsTo(BookingRecord::class, 'booking_record_id');
    }

    public function paymentRecord(): BelongsTo
    {
        return $this->belongsTo(PaymentRecord::class, 'last_payment_id');
    }
}
