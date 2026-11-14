<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

// Model Imports
use App\Models\BookingRecord;

#[Signature('app:initial-payment-check')]
#[Description(
    "Will trigger status change for 'room_bills' and 'booking_records' table when initial payments is unpaid
     when 'next_due_date' column inside of 'room_bills' table is hit"
)]
class InitialPaymentCheck extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $bookings = BookingRecord::query()
            ->where('status', 'approved')
            ->whereHas('roomBill', function ($q) {
                $q->where('status', 'unpaid')
                  ->where('next_due_date', '<=', now());
            })
            ->get();

        foreach ($bookings as $booking) {
            DB::transaction(function () use ($booking) {
                $booking->update([
                    'status' => 'cancelled'
                ]);

                $booking->roomBill()->update([
                    'status' => 'cancelled'
                ]);
            });
        }
    }
}
