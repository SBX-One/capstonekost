<?php

namespace App\Http\Requests\Api\V1\Admin\Issue;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IssueShowDetailRequest extends FormRequest
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
            'id' => [
                'required',
                'array',
                'exists:issues,id'
            ],
            'id.*' => [
                'int'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'id.required' => 'The issue ID is required.',
            'id.int' => 'The issue ID must be an integer.',
            'id.exists' => 'The selected issue does not exist.',
        ];
    }
}
