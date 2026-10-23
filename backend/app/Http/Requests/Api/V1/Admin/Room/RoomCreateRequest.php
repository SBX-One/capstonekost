<?php

namespace App\Http\Requests\Api\V1\Admin\Room;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RoomCreateRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255', 'unique:rooms,name'],
            'room_type' => ['required', 'integer', 'exists:room_types,id'],
            'floor' => ['required', 'integer', 'exists:rooms,floor'],
            'price' => ['required', 'integer', 'min:0'],
            'facilities' => ['nullable', 'array'],
            'facilities.*' => ['integer', 'exists:facilities,id'],
            'overview' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:255'],
            'rules' => ['required', 'string', 'max:255'],
            'images' => ['required', 'array', 'min:1', 'max:2048'],
            'images.*' => [
                'required',
                'image',
                'mimes:webp',
                'max:2048',
                'extensions:webp'
            ],
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Name is required',
            'name.string' => 'Name must be a string',
            'name.max' => 'Name may not be greater than 255 characters',
            'name.unique' => 'Name has already been picked',

            'room_type.required' => 'Room type is required',
            'room_type.integer' => 'Room type must be an integer',
            'room_type.exists' => 'Selected room type is invalid',

            'floor.required' => 'Floor is required',
            'floor.integer' => 'Floor must be an integer',
            'floor.exists' => 'Selected floor is invalid',

            'price.required' => 'Price is required',
            'price.integer' => 'Price must be an integer',
            'price.min' => 'Price cannot be negative',

            'facilities.array' => 'Facilities must be an array',
            'facilities.*.integer' => 'Each facility ID must be an integer',
            'facilities.*.exists' => 'One or more selected facilities are invalid',

            'overview.required' => 'Overview is required',
            'overview.string' => 'Overview must be a string',
            'overview.max' => 'Overview may not be greater than 255 characters',

            'description.required' => 'Description is required',
            'description.string' => 'Description must be a string',
            'description.max' => 'Description may not be greater than 255 characters',

            'rules.required' => 'Rules are required',
            'rules.string' => 'Rules must be a string',
            'rules.max' => 'Rules may not be greater than 255 characters',

            'image.required' => 'Image is required',
            'image.image' => 'The uploaded file must be an image',
            'image.mimes' => 'Image must be in AVIF format',
        ];
    }
}
