<?php

namespace Database\Seeders;

use App\Models\RoomImagePath;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoomImagePathSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        RoomImagePath::factory()->count(30)->create();
    }
}