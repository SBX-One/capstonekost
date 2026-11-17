<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

// Model Imports
use App\Models\BookingRecord;

#[Signature('app:booking-auto-billing')]
#[Description("Will run to check a room's billing and add month bill according to the room price")]
class BookingAutoBilling extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $bookings = BookingRecord::query()
            ->select('id', 'room_id')
            ->with([
                'room' => fn ($q) => $q->select('id', 'price'),
                'roomBill' => fn ($q) => $q->select('id', 'booking_record_id', 'amount_left', 'next_due_date')
            ])
            ->where('status', 'active')
            ->whereHas('roomBill', function ($q) {
                $q->where('status', 'partial')
                  ->where('next_due_date', '<=', now());
            })
            ->get();

        foreach ($bookings as $booking) {
            DB::transaction(function () use ($booking) {
                $currentMonthBill = $booking->roomBill->amount_left % $booking->room->price;

                if ($currentMonthBill == 0) {
                    $booking->roomBill->increment('current_month_bill', $booking->room->price);
                } else if ($currentMonthBill != 0) {
                    $booking->roomBill->increment('current_month_bill', $currentMonthBill);
                } 

                $booking->RoomBill->update([
                    'next_due_date' => Carbon::parse($booking->roomBill->next_due_date)->addDays(30)->toDateString()
                ]);
            });
        }
    }
}
