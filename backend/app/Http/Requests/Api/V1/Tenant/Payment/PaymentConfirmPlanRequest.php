<?php

namespace App\Http\Requests\Api\V1\Tenant\Payment;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class PaymentConfirmPlanRequest extends FormRequest
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
            'billing_id' => [
                'required',
                'integer',
                'exists:room_bills,id',
            ],
            'plan' => [
                'required',
                'string',
                'in:monthly,full',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'billing_id.required' => 'Payment ID is required.',
            'billing_id.integer' => 'Payment ID must be an integer.',
            'billing_id.exists' => 'The selected room bill record does not exist.',

            'plan.required' => 'Payment plan is required.',
            'plan.string' => 'Payment plan must be a string.',
            'plan.in' => 'Payment plan must be either monthly or full.',
        ];
    }
}
