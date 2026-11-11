<?php

namespace App\Http\Requests\Api\V1\Admin\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RecordPaymentRequest extends FormRequest
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
        'bookings_id' => [
            'required',
            'integer',
        ],
        'payment_date' => [
            'required',
            'date',
            'date_format:Y-m-d',
        ],
        'amount' => [
            'required',
            'integer',
            'min:100000',
        ],
        'method' => [
            'required',
            'string',
            'in:transfer,cash',
        ],
        'notes' => [
            'nullable',
            'string',
            'max:255',
        ],
    ];
}

public function messages(): array
{
    return [
        'bookings_id.required' => 'Booking ID is required.',
        'bookings_id.integer' => 'Booking ID must be an integer.',

        'payment_date.required' => 'Payment date is required.',
        'payment_date.date' => 'Payment date must be a valid date.',
        'payment_date.date_format' => 'Payment date must follow the YYYY-MM-DD format.',

        'amount.required' => 'Payment amount is required.',
        'amount.integer' => 'Payment amount must be an integer.',
        'amount.min' => 'Payment amount must be at least 100,000.',

        'method.required' => 'Payment method is required.',
        'method.string' => 'Payment method must be a string.',
        'method.in' => 'Payment method must be either cash or transfer.',

        'notes.string' => 'Notes must be a string.',
        'notes.max' => 'Notes cannot exceed 255 characters.',
    ];
}
}
