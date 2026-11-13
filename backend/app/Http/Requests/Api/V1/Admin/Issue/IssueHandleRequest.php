<?php

namespace App\Http\Requests\Api\V1\Admin\Issue;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IssueHandleRequest extends FormRequest
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
        ];
    }

    public function messages(): array
    {
        return [
            'issue_id.required' => 'The issue ID is required.',
            'issue_id.integer' => 'The issue ID must be an integer.',
            'issue_id.exists' => 'The selected issue does not exist.',

            'description.required' => 'The description is required.',
            'description.string' => 'The description must be a string.',
            'description.max' => 'The description must not exceed 255 characters.',

            'images.array' => 'Images must be submitted as an array.',

            'images.*.file' => 'Each image must be a valid uploaded file.',
            'images.*.mimes' => 'Images must be in JPG, JPEG, PNG, or WEBP format.',
            'images.*.min' => 'Each image must be at least 1 KB.',
            'images.*.max' => 'Each image must not exceed 2 MB.',
        ];
    }
}
