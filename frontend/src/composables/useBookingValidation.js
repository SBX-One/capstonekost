import { useValidation } from '@/composables/useValidation'
import {
    required,
    isValidEmail,
    isValidPhone,
    maxLength,
    isValidDate,
    minDateToday,
    isAfterDate
} from '@/utils/validators'

export function useBookingValidation(formData) {
    const rules = {
        fullName: [
            v => required(v, 'Full Name'),
            v => maxLength(v, 255, 'Full Name')
        ],
        phoneNumber: [
            v => required(v, 'Phone Number'),
            v => isValidPhone(v)
        ],
        email: [
            v => required(v, 'Email Address'),
            v => isValidEmail(v)
        ],
        moveIn: [
            v => required(v, 'Move-in Date'),
            v => isValidDate(v, 'Move-in Date'),
            v => minDateToday(v, 'Move-in Date')
        ],
        moveOut: [
            v => required(v, 'Move-out Date'),
            v => isValidDate(v, 'Move-out Date'),
            v => isAfterDate(v, formData.moveIn, 'Move-out Date', 'Move-in Date')
        ]
    }

    return useValidation(rules)
}