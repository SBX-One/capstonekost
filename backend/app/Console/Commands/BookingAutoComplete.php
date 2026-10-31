<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

// Model Imports
use App\Models\BookingRecord;

#[Signature('app:booking-auto-complete')]
#[Description('Triggers status changes to Complete for complete bookings')]
class BookingAutoComplete extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        BookingRecord::query()
            ->where('status', 'active')
            ->where('move_out', '<', today())
            ->update([
                'status' => 'complete',
            ]);

        $this->info("Successfully set expired active booking dates status to complete");

        return self::SUCCESS;
    }
}
