import { useValidation } from '@/composables/useValidation'
import { required, maxLength, isPositiveInteger, validateFileArray } from '@/utils/validators'

export function useAdminComplaintValidation(mode = 'handle') {
    const baseRules = {
        issue_id: [
            v => required(v, 'Issue ID'),
            v => isPositiveInteger(v, 'Issue ID')
        ],
        description: [
            v => required(v, 'Response Description'),
            v => maxLength(v, 255, 'Response Description')
        ],
        images: [
            v => validateFileArray(v, 4, 2, 'Proof Image', 1)
        ]
    }

    const rules = mode === 'resolve'
        ? {
            response_id: [
                v => required(v, 'Response ID'),
                v => isPositiveInteger(v, 'Response ID')
            ],
            ...baseRules
        }
        : {
            ...baseRules
        }

    return useValidation(rules)
}