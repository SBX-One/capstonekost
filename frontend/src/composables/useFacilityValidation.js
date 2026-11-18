import { useValidation } from '@/composables/useValidation'
import { required, maxLength } from '@/utils/validators'

export function useFacilityValidation() {
    const rules = {
        name: [
            v => required(v, 'Facility Name'),
            v => maxLength(v, 100, 'Facility Name')
        ],
        information: [
            v => required(v, 'Facility Information'),
            v => maxLength(v, 32, 'Facility Information')
        ],
        icon_name: [
            v => required(v, 'Facility Icon')
        ]
    }

    return useValidation(rules)
}