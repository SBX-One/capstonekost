<?php

namespace App\Exceptions\Api\V1\Admin\Issue;

use Exception;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class IssueHandlingFailException extends Exception
{
    /**
     * @param    array        $uploadedImages   the images that were being stored
     * @param    \Throwable   $previous         the original error that rolled back the transaction
     */
    public function __construct(
        protected array $uploadedImages = [],
        \Throwable $previous = null,
    ) {
        parent::__construct($previous?->getMessage() ?? 'Issue handling failed rolling back images.', 0, $previous);
    }

    /**
     * Runs automatically after the transaction has rolled back.
     * Deletes any orphaned files the upload left behind.
     */
    public function report(): void
    {
        if ($this->uploadedImages) {
            foreach ($this->uploadedImages as $imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
        }

        Log::error('Response handling creation rolled back; orphaned images cleaned.', [
            'images' => count($this->uploadedImages),
            'error'  => $this->getPrevious()?->getMessage(),
        ]);
    }

    public function render($request)
    {
        return response()->json([
            'message' => 'Failed to create handle response. Please try again.',
        ], 500);
    }
}
