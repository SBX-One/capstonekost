<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

// Model Imports
use App\Models\BookingRecord;

#[Signature('app:bill-check-overdue')]
#[Description("To check an active booking's room bill next due date and sets it to overdue")]
class BillCheckOverdue extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $bookings = BookingRecord::query()
            ->where('status', 'active')
            ->whereHas('roomBill', function ($q) {
                $q->where('current_month_bill', '!=', 0)
                  ->where('next_due_date', '<=', now());
            })
            ->get();
        
        foreach ($bookings as $booking) {
            DB::transaction(function () use ($booking) {
                $booking->roomBill()->update([
                    'status' => 'overdue'
                ]);
            });
        }
    }
}
