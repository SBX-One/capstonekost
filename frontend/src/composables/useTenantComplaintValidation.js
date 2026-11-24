import { useValidation } from '@/composables/useValidation'
import { required, maxLength, isPositiveInteger, validateFileArray } from '@/utils/validators'

export function useTenantComplaintValidation() {
    const rules = {
        room_id: [
            v => {
                if (v === null || v === undefined || v === '') {
                    return { valid: true, message: '' }
                }
                return isPositiveInteger(v, 'Room')
            }
        ],
        location_name: [
            v => required(v, 'Location'),
            v => maxLength(v, 255, 'Location')
        ],
        title: [
            v => required(v, 'Title'),
            v => maxLength(v, 255, 'Title')
        ],
        description: [
            v => required(v, 'Description'),
            v => maxLength(v, 255, 'Description')
        ],
        images: [
            v => validateFileArray(v, 4, 2, 'Issue Image', 1)
        ]
    }

    return useValidation(rules)
}