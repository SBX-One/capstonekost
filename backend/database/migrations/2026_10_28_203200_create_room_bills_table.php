<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('room_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_record_id')->constrained('booking_records')->cascadeOnDelete();
            $table->foreignId('last_payment_id')->constrained('payment_records');
            $table->integer('amount_left')->nullable(false);
            $table->integer('current_month_bill')->nullable(false);
            $table->enum('status', ['paid this month', 'fully paid', 'overdue', 'unpaid this month']);
            $table->dateTime('next_due_date', precision: 0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('room_bills');
    }
};
