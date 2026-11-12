<?php

namespace App\Http\Requests\Api\V1\Tenant\Issue;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IssueReportRequest extends FormRequest
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
            'location_id' => [
                'nullable',
                'integer',
                'exists:rooms,id'
            ],

            'location_name' => [
                'required',
                'string',
                'max:255'
            ],

            'title' => [
                'required',
                'string',
                'max:255'
            ],

            'description' => [
                'required',
                'string',
                'max:255'
            ],

            'images' => [
                'nullable',
                'array'
            ],

            'images.*' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'min:1',
                'max:2048'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'location_id.integer' => 'Location ID must be a valid integer.',
            'location_id.exists' => 'The selected room does not exist.',

            'location_name.required' => 'Location name is required.',
            'location_name.string' => 'Location name must be a string.',
            'location_name.max' => 'Location name must not exceed 255 characters.',

            'title.required' => 'Issue title is required.',
            'title.string' => 'Issue title must be a string.',
            'title.max' => 'Issue title must not exceed 255 characters.',

            'description.required' => 'Issue description is required.',
            'description.string' => 'Issue description must be a string.',
            'description.max' => 'Issue description must not exceed 255 characters.',

            'images.array' => 'Images must be submitted as an array.',

            'images.*.file' => 'Each image must be a valid uploaded file.',
            'images.*.mimes' => 'Images must be in JPG, JPEG, PNG, or WEBP format.',
            'images.*.min' => 'Each image must be at least 1 KB.',
            'images.*.max' => 'Each image must not exceed 2 MB.',
        ];
    }
}
