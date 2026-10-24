<?php

namespace App\Http\Controllers\Api\V1\Meta;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

// Model Imports
use App\Models\RoomType;
use App\Models\Facility;
use App\Models\Utility;

// Resource Imports
use App\Http\Resources\Api\V1\Meta\RoomsMetaResource;

class RoomsMetaController extends Controller
{
    public function meta() 
    {
        $roomTypes = RoomType::select('id', 'name')->get();
        $facilities = Facility::select('id', 'name', 'information', 'icon_name')->get();
        $utilities = Utility::select('id', 'name', 'information', 'icon_name')->get();

        return (new RoomsMetaResource([
            'roomTypes' => $roomTypes,
            'facilities' => $facilities,
            'utilities' => $utilities
        ]))->additional([
            'message' => 'Meta data successfully returned'
        ]);
    }
}
