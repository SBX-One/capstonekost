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
        Schema::create('issue_responses_image_paths', function (Blueprint $table) {
            $table->id();
            $table->foreignId('response_id')->constrained('issue_responses')->cascadeOnDelete();
            $table->string('image_path', 255)->nullable(false);
            $table->string('image_path', 255)->nullable(false);
            $table->smallInteger('sort_order')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('issue_responses_image_paths');
    }
};
