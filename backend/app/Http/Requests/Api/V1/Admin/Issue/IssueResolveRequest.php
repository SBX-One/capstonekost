<?php

namespace App\Http\Requests\Api\V1\Admin\Issue;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IssueResolveRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            // Response ID
            'response_id' => [
                'required',
                'integer',
                'exists:issue_responses,id',
            ],

            // Issue ID
            'issue_id' => [
                'required',
                'integer',
                'exists:issues,id',
            ],

            // Description
            'description' => [
                'required',
                'string',
                'max:255',
            ],

            // Images
            'images' => [
                'nullable',
                'array',
            ],

            'images.*' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'min:1',
                'max:2048',
            ],

            // Deleted images
            'deleted_images' => [
                'nullable',
                'array',
            ],

            'deleted_images.*' => [
                'integer',
                'exists:room_image_paths,id',
            ],
        ];
    }
}
