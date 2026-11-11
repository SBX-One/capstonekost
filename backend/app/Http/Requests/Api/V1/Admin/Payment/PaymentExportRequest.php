<?php

namespace App\Http\Requests\Api\V1\Admin\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PaymentExportRequest extends FormRequest
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
            'start_date' => ['required', 'required_with:end_date', 'date', 'date_format:Y-m-d'],
            'end_date' => ['required', 'required_with:start_date', 'date', 'date_format:Y-m-d'],
            'status' => ['nullable', 'string', 'in:unpaid,partially paid,paid'],
            'room_id' => ['nullable', 'integer', 'exists:rooms,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'start_date.required' => 'Start date is required.',
            'start_date.required_with' => 'Start date is required when end date is provided.',
            'start_date.date' => 'Start date must be a valid date.',
            'start_date.date_format' => 'Start date must follow the YYYY-MM-DD format.',

            'end_date.required' => 'End date is required.',
            'end_date.required_with' => 'End date is required when start date is provided.',
            'end_date.date' => 'End date must be a valid date.',
            'end_date.date_format' => 'End date must follow the YYYY-MM-DD format.',

            'status.string' => 'Status must be a string.',
            'status.in' => 'Status must be unpaid, partially paid, or paid.',

            'room_id.integer' => 'Room ID must be an integer.',
            'room_id.exists' => 'The selected room does not exist.',
        ];
    }
}
