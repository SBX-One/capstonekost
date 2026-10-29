<?php

namespace App\Http\Requests\Api\V1\Tenant\Booking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BookingShowDetailRequest extends FormRequest
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
            'id' => ['required', 'array'],
            'id.*' => ['int', 'exists:booking_records,id']
        ];
    }

    public function messages(): array
    {
        return [
            'id.required' => 'The booking IDs are required.',
            'id.array' => 'The booking IDs must be provided as an array.',

            'id.*.int' => 'Each booking ID must be an integer.',
            'id.*.exists' => 'One or more selected booking IDs do not exist.',
        ];
    }
}
