import { useValidation } from '@/composables/useValidation';
import { required, maxLength } from '@/utils/validators';

export function useActionBookingValidation(role, formData) {
    const rules = {
        reasonDropdown: [
            v => required(v, 'Reason')
        ],
        reasonText: [
            v => {
                if (role === 'admin' && formData.reasonDropdown === 'Others') {
                    return required(v, 'Specific Reason')
                }
                return { valid: true, message: '' }
            },
            v => maxLength(v, 255, 'Specific Reason')
        ]
    }

    return useValidation(rules)
}