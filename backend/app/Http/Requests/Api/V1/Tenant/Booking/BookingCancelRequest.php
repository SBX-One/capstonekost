<?php

namespace App\Http\Requests\Api\V1\Tenant\Booking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BookingCancelRequest extends FormRequest
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
            'reason' => ['required', 'string', 'max:255']
        ];
    }

    public function messages(): array
    {
        return [
            'reason.required' => 'The rejection reason is required.',
            'reason.string' => 'The rejection reason must be a string.',
            'reason.max' => 'The rejection reason may not exceed 255 characters.',
        ];
    }
}
