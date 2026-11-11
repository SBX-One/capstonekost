<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['booking_record_id', 'payment_plan', 'amount_left', 'current_month_bill', 'status', 'next_due_date'])]
class RoomBill extends Model
{
    public function bookingRecord(): BelongsTo
    {
        return $this->belongsTo(BookingRecord::class, 'booking_record_id');
    }

    public function paymentRecord(): HasMany
    {
        return $this->hasMany(PaymentRecord::class, 'room_bill_id');
    }

    public function latestPaymentRecord()
    {
        return $this->hasOne(PaymentRecord::class)
            ->orderByDesc('payment_date');
    }
}
