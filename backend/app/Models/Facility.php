<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable(['name', 'information'])]
class Facility extends Model
{
    use HasFactory;

    /**
     * Get all rooms that have this facility.
     */
    public function rooms()
    {
        return $this->belongsToMany(Room::class, 'room_facilities', 'facility_id', 'room_id');
    }
}