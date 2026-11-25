import { unref } from 'vue'
import { useValidation } from '@/composables/useValidation'
import {
    required,
    isNumeric,
    maxLength,
    isPositiveInteger,
    isStrictIsoDate,
    createAmountRangeValidator
} from '@/utils/validators'
import { formatRupiah } from '@/utils/formatters'

const MIN_PAYMENT_AMOUNT = 100000
const VALID_PAYMENT_METHODS = ['transfer', 'cash']

export function useRecordPaymentValidation(formData, options = {}) {
    const amountRangeValidator = createAmountRangeValidator(
        () => unref(options.maxAmount),
        {
            min: MIN_PAYMENT_AMOUNT,
            fieldName: 'Payment Amount',
            format: formatRupiah,
            maxLabel: 'the remaining balance'
        }
    )

    const rules = {
        bookings_id: [
            v => required(v, 'Booking'),
            v => isPositiveInteger(v, 'Booking')
        ],
        payment_date: [
            v => required(v, 'Payment Date'),
            v => isStrictIsoDate(v, 'Payment Date')
        ],
        amount: [
            v => required(v, 'Payment Amount'),
            v => isNumeric(v, 'Payment Amount'),
            v => isPositiveInteger(v, 'Payment Amount'),
            amountRangeValidator
        ],
        method: [
            v => required(v, 'Payment Method'),
            v => {
                const normalized = String(v || '').trim().toLowerCase()
                if (!VALID_PAYMENT_METHODS.includes(normalized)) {
                    return {
                        valid: false,
                        message: 'Payment Method must be either Cash or Bank Transfer.'
                    }
                }
                return { valid: true, message: '' }
            }
        ],
        notes: [
            v => maxLength(v, 255, 'Notes')
        ]
    }

    return useValidation(rules)
}