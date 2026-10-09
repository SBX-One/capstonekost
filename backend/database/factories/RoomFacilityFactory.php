<?php

namespace Database\Factories;

use App\Models\RoomFacility;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoomFacility>
 */
class RoomFacilityFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'room_id' => rand(1, 30),
            'facility_id' => rand(1, 5),
        ];
    }
}