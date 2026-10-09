<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name'])]
class RoomType extends Model
{
    use HasFactory;

    /**
     * Get the rooms for this room type.
     */
    public function rooms()
    {
        return $this->hasMany(Room::class, 'room_type_id');
    }
}