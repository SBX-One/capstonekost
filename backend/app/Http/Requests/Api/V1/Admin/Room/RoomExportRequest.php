<?php

namespace App\Http\Requests\Api\V1\Admin\Room;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RoomExportRequest extends FormRequest
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
            'room_status' => ['nullable', 'string', 'in:available,occupied'],
            'room_type' => ['nullable', 'integer', 'exists:room_types,id'],
            'floors' => ['nullable', 'integer', 'in:1,2,3'],
        ];
    }

    public function messages(): array
    {
        return [
            'room_status.string' => 'Room status must be a string.',
            'room_status.in' => 'Room status must be either available or occupied.',

            'room_type.integer' => 'Room type must be an integer.',
            'room_type.exists' => 'The selected room type does not exist.',

            'floors.integer' => 'Floor must be an integer.',
            'floors.in' => 'Floor must be either 1, 2, or 3.',
        ];
    }
}
