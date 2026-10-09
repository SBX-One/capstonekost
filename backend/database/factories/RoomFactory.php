<?php

namespace Database\Factories;

use App\Models\Room;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Room>
 */
class RoomFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence(2),
            'room_type_id' => rand(1, 3),
            'price' => rand(1000000, 3000000),
            'floor' => rand(1, 3),
            'status' => $this->faker->randomElement(['available', 'occupied']),
            'description' => $this->faker->sentence(),
            'rules' => $this->faker->paragraph(),
        ];
    }
}

