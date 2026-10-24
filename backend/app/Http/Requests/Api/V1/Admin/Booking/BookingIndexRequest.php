<?php

namespace App\Http\Requests\Api\V1\Admin\Booking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class BookingIndexRequest extends FormRequest
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
            'status' => ['nullable', 'string', 'in:pending,cancelled,rejected,active,complete']
        ];
    }

    public function messages(): array
    {
        return [
            'status.string' => 'The status must be a string.',
            'status.in' => 'The selected status is invalid. Allowed statuses are: pending, cancelled, rejected, active, complete.',
        ];
    }
}
