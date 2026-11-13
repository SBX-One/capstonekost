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
            'response_id' => [
                'required',
                'integer',
                'exists:issue_responses,id',
            ],

            'issue_id' => [
                'required',
                'integer',
                'exists:issues,id',
            ],

            'description' => [
                'required',
                'string',
                'max:255',
            ],

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

            'deleted_images' => [
                'nullable',
                'array',
            ],

            'deleted_images.*' => [
                'integer',
                'exists:issue_response_image_paths,id',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'response_id.required' => 'The response ID is required.',
            'response_id.integer' => 'The response ID must be an integer.',
            'response_id.exists' => 'The selected response does not exist.',

            'issue_id.required' => 'The issue ID is required.',
            'issue_id.integer' => 'The issue ID must be an integer.',
            'issue_id.exists' => 'The selected issue does not exist.',


            'description.required' => 'The description is required.',
            'description.string' => 'The description must be a string.',
            'description.max' => 'The description must not exceed 255 characters.',

            'images.array' => 'Images must be submitted as an array.',
            'images.*.file' => 'Each image must be a valid uploaded file.',
            'images.*.mimes' => 'Images must be JPG, JPEG, PNG, or WEBP files.',
            'images.*.min' => 'Each image must be at least 1 KB.',
            'images.*.max' => 'Each image must not exceed 2 MB.',

            'deleted_images.array' => 'Deleted images must be submitted as an array.',
            'deleted_images.*.integer' => 'Each deleted image ID must be an integer.',
            'deleted_images.*.exists' => 'One or more selected image IDs do not exist.',
        ];
    }
}
