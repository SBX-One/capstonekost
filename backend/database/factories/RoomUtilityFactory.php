<?php

namespace Database\Factories;

use App\Models\RoomUtility;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoomUtility>
 */
class RoomUtilityFactory extends Factory
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
            'utility_id' => rand(1, 5),
        ];
    }
}