<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Fillable(['user_id', 'room_id', 'location_name', 'title', 'description', 'status'])]
class Issue extends Model
{
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function imagePaths(): HasMany
    {
        return $this->hasMany(IssueImagePath::class, 'issue_id');
    }

    public function response(): HasOne
    {
        return $this->hasOne(IssueResponse::class, 'issue_id');
    }
}
