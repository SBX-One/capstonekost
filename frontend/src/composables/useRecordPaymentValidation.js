import { unref } from 'vue'
import { useValidation } from '@/composables/useValidation'
import {
    required,
    isNumeric,
    minValue,
    maxLength,
    isPositiveInteger,
    isStrictIsoDate
} from '@/utils/validators'
import { formatRupiah } from '@/utils/formatters'

const MIN_PAYMENT_AMOUNT = 100000
const VALID_PAYMENT_METHODS = ['transfer', 'cash']

export function useRecordPaymentValidation(formData, options = {}) {
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
            v => {
                const result = minValue(v, MIN_PAYMENT_AMOUNT, 'Payment Amount')
                if (!result.valid) {
                    return {
                        valid: false,
                        message: `Payment Amount must be at least ${formatRupiah(MIN_PAYMENT_AMOUNT)}.`
                    }
                }
                return result
            },
            v => {
                const maxLimit = Number(unref(options.maxAmount))
                if (Number.isFinite(maxLimit) && maxLimit > 0 && Number(v) > maxLimit) {
                    return {
                        valid: false,
                        message: `Payment amount cannot exceed the remaining balance (${formatRupiah(maxLimit)}).`
                    }
                }
                return { valid: true, message: '' }
            }
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