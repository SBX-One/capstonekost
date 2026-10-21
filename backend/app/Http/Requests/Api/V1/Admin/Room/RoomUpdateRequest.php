<?php

namespace App\Http\Requests\Api\V1\Admin\Room;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RoomUpdateRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'room_type' => ['required', 'integer', 'exists:room_types,id'],
            'floor' => ['required', 'integer'],
            'price' => ['required', 'integer', 'min:0'],
            'facilities' => ['nullable', 'array'],
            'facilities.*' => ['integer', 'exists:facilities,id'],
            'overview' => ['required', 'string'],
            'description' => ['required', 'string'],
            'rules' => ['required', 'string'],
            'images' => ['nullable', 'array', 'min:1', 'max:2048'],
            'images.*' => [
                'required',
                'image',
                'mimes:avif',
                'max:2048',
            ],
            'deleted_images' => ['nullable', 'array'],
            'deleted_images.*' => ['integer', 'exists:room_image_paths,id']
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

            'room_type.required' => 'Room type is required',
            'room_type.integer' => 'Room type must be an integer',
            'room_type.exists' => 'Selected room type is invalid',

            'floor.required' => 'Floor is required',
            'floor.integer' => 'Floor must be an integer',

            'price.required' => 'Price is required',
            'price.integer' => 'Price must be an integer',
            'price.min' => 'Price cannot be negative',

            'facilities.array' => 'Facilities must be an array',
            'facilities.*.integer' => 'Each facility ID must be an integer',
            'facilities.*.exists' => 'One or more selected facilities are invalid',

            'overview.required' => 'Overview is required',
            'overview.string' => 'Overview must be a string',

            'description.required' => 'Description is required',
            'description.string' => 'Description must be a string',

            'rules.required' => 'Rules are required',
            'rules.string' => 'Rules must be a string',

            'image.image' => 'The uploaded file must be an image',
            'image.mimes' => 'Image must be in AVIF format',

            'deleted_images.array' => 'Deleted images must be an array',
            'deleted_images.*.integer' => 'Each deleted image ID must be an integer',
            'deleted_images.*.exists' => 'One or more images IDs provided to delete are invalid',
        ];
    }
}
