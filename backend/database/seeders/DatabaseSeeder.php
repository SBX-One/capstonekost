<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

// Seeder Imports
use Database\Seeders\RoomSeeder;
use Database\Seeders\RoomImagePathSeeder;
use Database\Seeders\RoomTypeSeeder;
use Database\Seeders\RoomFacilitySeeder;
use Database\Seeders\FacilitySeeder;
use Database\Seeders\RoomUtilitySeeder;
use Database\Seeders\UtilitySeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Admin',
        //     'email' => 'Admin@admin.com',
        //     'phone' => '081234567890'
        // ]);

        User::factory()->count(5)->create();
        
        $this->call([
            UtilitySeeder::class,
            FacilitySeeder::class,
            RoomTypeSeeder::class,
            RoomSeeder::class,
            RoomImagePathSeeder::class,
            RoomFacilitySeeder::class,
            RoomUtilitySeeder::class,
        ]);
    }
}
