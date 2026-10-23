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
        Schema::create('booking_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('rooms');
            $table->foreignId('user_id')->constrained('users');
            $table->dateTime('move_in')->nullable(false);
            $table->dateTime('move_out')->nullable(false);
            $table->integer('rental_duration')->nullable(false);
            $table->enum('status', ['pending', 'rejected', 'active', 'complete'])->nullable(false)->default('pending');
            $table->integer('total')->nullable(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('booking_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_record_id')->constrained('booking_records')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->string('name')->nullable(false);
            $table->string('phone_number', 20)->nullable(false);
            $table->string('email')->nullable(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('booking_contacts');
        Schema::dropIfExists('booking_records');
    }
};
