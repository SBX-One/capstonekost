<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['response_id', 'image_path', 'sort_order'])]
class IssueResponseImagePath extends Model
{
    public function response(): BelongsTo
    {
        return $this->belongsTo(IssueResponse::class, 'response_id');
    }
}
