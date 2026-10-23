<?php

namespace App\Http\Requests\Api\V1\Admin\Room;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RoomIndexRequest extends FormRequest
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
            'min_price' => [
                'integer',
                'nullable',
                'required_with:max_price',
            ],
            'max_price' => [
                'integer',
                'nullable',
                'required_with:min_price',
            ],
            'room_type' => [
                'integer',
                'nullable',
                'exists:room_types,id',
            ],
            'floor' => [
                'integer',
                'nullable',
                'in:1,2,3',
            ],
            'status' => [
                'string',
                'nullable',
                'in:available,occupied',
            ],
            'facilities' => [
                'array',
                'nullable',
            ],
            'facilities.*' => [
                'integer',
                'exists:facilities,id'
            ],
            'search' => [
                'string',
                'nullable'
            ]
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'min_price.integer' => 'The min price must be an integer.',
            'min_price.required_with' => 'The min price field is required when max price is present.',
            'max_price.integer' => 'The max price must be an integer.',
            'max_price.required_with' => 'The max price field is required when min price is present.',
            'room_type.exists' => 'The selected room type is invalid.',
            'floor.exists' => 'The selected floor is invalid.',
            'status.in' => 'The status must be either available or occupied.',
        ];
    }
}
