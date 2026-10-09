<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name', 'information'])]
class Utility extends Model
{
    use HasFactory;

    /**
     * Get all rooms that have this utility.
     */
    public function rooms()
    {
        return $this->belongsToMany(Room::class, 'room_utilities', 'utility_id', 'room_id');
    }
}