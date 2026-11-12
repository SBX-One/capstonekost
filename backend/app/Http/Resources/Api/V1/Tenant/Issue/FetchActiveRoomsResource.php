<?php

namespace App\Http\Resources\Api\V1\Tenant\Issue;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FetchActiveRoomsResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource['id'],
            'name' => $this->resource['room']->name
        ];
    }
}
