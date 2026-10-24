<?php

namespace App\Http\Requests\Api\V1\Tenant\Room;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RoomShowRequest extends FormRequest
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
            'id' => ['required', 'integer', 'min:1', 'exists:rooms,id'],
        ];
    }

    public function validationData(): array
    {
        return array_merge($this->all(), [
            'id' => $this->route('id'),
        ]);
    }


    public function messages(): array
    {
        return [
            'id.required' => 'The room ID is required.',
            'id.integer' => 'The room ID must be an integer.',
            'id.min' => 'The room ID must be greater than 0.',
            'id.exists' => 'The room ID is incorrect.'
        ];
    }
}
