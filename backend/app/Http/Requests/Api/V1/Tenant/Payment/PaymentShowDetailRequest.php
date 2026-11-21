<?php

namespace App\Http\Requests\Api\V1\Tenant\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PaymentShowDetailRequest extends FormRequest
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
                'exists:booking_records,id'
            ],
            'id.*' => [
                'int'
            ]
        ];
    }

    public function messages(): array
    {
        return [
            'id.required' => 'The booking record ID is required.',
            'id.array' => 'The booking record ID must be an array.',
            'id.int' => 'The booking record ID must be an integer.',
            'id.exists' => 'The selected booking record does not exist.',
        ];
    }
}
