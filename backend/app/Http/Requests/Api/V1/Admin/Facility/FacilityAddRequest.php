<?php

namespace App\Http\Requests\Api\V1\Admin\Facility;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class FacilityAddRequest extends FormRequest
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
            'name' => ['required', 'string'],
            'information' => ['required', 'string', 'max:32'],
            'icon_name' => ['required', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Facility name is required.',
            'name.string' => 'Facility name must be a string.',

            'information.required' => 'Facility information is required.',
            'information.string' => 'Facility information must be a string.',
            'information.max' => 'Facility information must not exceed 32 characters.',

            'icon_name.required' => 'Icon name is required.',
            'icon_name.string' => 'Icon name must be a string.',
        ];
    }
}
