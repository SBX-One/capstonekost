<?php

namespace App\Http\Requests\Api\V1\Tenant\Booking;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BookingBookRequest extends FormRequest
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
            'move_in' => ['required', 'date', 'date_format:Y-m-d', 'required_with:move_out'],
            'move_out' => ['required', 'date', 'date_format:Y-m-d', 'required_with:move_in'],
            'rental_duration' => ['required', 'int', 'min:1'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255'],
            'phone' => ['required', 'min:10', 'max:20']
        ];
    }

    public function messages(): array
    {
        return [
            'move_in.required' => 'The move-in date is required.',
            'move_in.date' => 'The move-in date must be a valid date.',
            'move_in.date_format' => 'The move-in date must follow the YYYY-MM-DD format.',
            'move_in.required_with' => 'The move-in date is required when the move-out date is provided.',

            'move_out.required' => 'The move-out date is required.',
            'move_out.date' => 'The move-out date must be a valid date.',
            'move_out.date_format' => 'The move-out date must follow the YYYY-MM-DD format.',
            'move_out.required_with' => 'The move-out date is required when the move-in date is provided.',

            'rental_duration.required' => 'The rental duration is required.',
            'rental_duration.int' => 'The rental duration must be an integer.',
            'rental_duration.min' => 'The rental duration must be at least 1.',
        ];
    }
}
