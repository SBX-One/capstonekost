<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;


#[Fillable(['room_type_id', 'price', 'floor', 'status', 'description', 'rules'])]
class Room extends Model
{
    /** @use HasFactory<\Database\Factories\RoomFactory> */
    use HasFactory;

    /**
     * Get the room type that owns the room.
     */
    public function roomType()
    {
        return $this->belongsTo(RoomType::class, 'room_type_id');
    }

    /**
     * Get the image paths for this room.
     */
    public function imagePaths()
    {
        return $this->hasMany(RoomImagePath::class, 'room_id');
    }

    /**
     * Get all facilities for this room.
     */
    public function facilities(): BelongsToMany
    {
        return $this->belongsToMany(Facility::class, 'room_facilities', 'room_id', 'facility_id');
    }

    /**
     * Get all utilities for this room.
     */
    public function utilities(): BelongsToMany
    {
        return $this->belongsToMany(Utility::class, 'room_utilities', 'room_id', 'utility_id');
    }
}
