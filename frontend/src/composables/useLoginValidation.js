import { useValidation } from '@/composables/useValidation'
import { required, isValidEmail, maxLength } from '@/utils/validators'

export function useLoginValidation() {
    const rules = {
        email: [
            v => required(v, 'Email'),
            v => isValidEmail(v),
            v => maxLength(v, 255, 'Email')
        ],
        password: [
            v => required(v, 'Password')
        ]
    }

    return useValidation(rules)
}