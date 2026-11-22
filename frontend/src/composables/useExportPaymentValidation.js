import { useValidation } from '@/composables/useValidation'
import {
    required,
    isPositiveInteger,
    isStrictIsoDate,
    isSameOrAfterDate
} from '@/utils/validators'

const VALID_EXPORT_STATUSES = ['unpaid', 'partially paid', 'paid']

export function useExportPaymentValidation(formData) {
    const rules = {
        start_date: [
            v => required(v, 'Start Date'),
            v => isStrictIsoDate(v, 'Start Date')
        ],
        end_date: [
            v => required(v, 'End Date'),
            v => isStrictIsoDate(v, 'End Date'),
            v => isSameOrAfterDate(v, formData.start_date, 'End Date', 'Start Date')
        ],
        status: [
            v => {
                if (!v || String(v).trim().toLowerCase() === 'all') {
                    return { valid: true, message: '' }
                }
                const normalized = String(v).trim().toLowerCase()
                if (!VALID_EXPORT_STATUSES.includes(normalized)) {
                    return {
                        valid: false,
                        message: 'Invalid payment status filter.'
                    }
                }
                return { valid: true, message: '' }
            }
        ],
        room_id: [
            v => {
                if (v === null || v === undefined || v === '') {
                    return { valid: true, message: '' }
                }
                return isPositiveInteger(v, 'Room')
            }
        ]
    }

    return useValidation(rules)
}