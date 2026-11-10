<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['booking_record_id', 'room_bill_id', 'amount', 'method', 'note', 'next_due_date'])]
class PaymentRecord extends Model
{
    public function bookingRecord(): BelongsTo
    {
        return $this->belongsTo(BookingRecord::class, 'booking_record_id');
    }

    public function roomBill(): BelongsTo
    {
        return $this->belongsTo(RoomBill::class, 'room_bill_id');
    }
}
