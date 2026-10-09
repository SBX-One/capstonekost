<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['room_id', 'image_path', 'sort_order'])]
class RoomImagePath extends Model
{
    use HasFactory;

    /**
     * Get the room that owns this image path.
     */
    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }
}