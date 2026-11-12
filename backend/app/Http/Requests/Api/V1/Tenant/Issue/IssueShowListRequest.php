<?php

namespace App\Http\Requests\Api\V1\Tenant\Issue;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IssueShowListRequest extends FormRequest
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
            'filter' => [
                'nullable', 
                'string', 
                'in:open,progress,resolved'
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'filter.nullable' => 'The filter field must be a valid status.',
            'filter.string' => 'The filter must be a string.',
            'filter.in' => 'The selected filter must be one of the following: open, progress, or resolved.',
        ];
    }
}
