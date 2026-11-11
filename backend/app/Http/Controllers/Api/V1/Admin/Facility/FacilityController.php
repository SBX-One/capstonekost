<?php

namespace App\Http\Controllers\Api\V1\Admin\Facility;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// Model Imports
use App\Models\Facility;

// Request Imports
use App\Http\Requests\Api\V1\Admin\Facility\FacilityAddRequest;

class FacilityController extends Controller
{
    public function add(FacilityAddRequest $request)
    {
        $payload = $request->validated();


        $facility = DB::transaction(function () use ($payload) {
            $facility = Facility::query()
                ->create([
                    'name' => $payload['name'],
                    'information' => $payload['information'],
                    'icon_name' => $payload['icon_name']
                ]);

            return $facility;
        });

        return response()->json([
            'message' => 'Facility Created.'
        ], 201);
    }
}
