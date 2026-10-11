import { useValidation } from '@/composables/useValidation'
import { required, minLength, maxLength, isValidEmail, isValidPhone } from '@/utils/validators'

export function useRegisterValidation() {
    const rules = {
        fullName: [
            v => required(v, 'Full Name'),
            v => maxLength(v, 255, 'Full Name')
        ],
        email: [
            v => required(v, 'Email'),
            v => isValidEmail(v),
            v => maxLength(v, 255, 'Email')
        ],
        phoneNumber: [
            v => required(v, 'Phone Number'),
            v => isValidPhone(v),
            v => maxLength(v, 255, 'Phone Number')
        ],
        password: [
            v => required(v, 'Password'),
            v => minLength(v, 8, 'Password')
        ]
    }

    return useValidation(rules)
}