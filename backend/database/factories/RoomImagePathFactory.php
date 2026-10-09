<?php

namespace Database\Factories;

use App\Models\RoomImagePath;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RoomImagePath>
 */
class RoomImagePathFactory extends Factory
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
            'image_path' => $this->faker->imageUrl(),
            'sort_order' => rand(1, 4),
        ];
    }
}