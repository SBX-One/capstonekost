import { useValidation } from '@/composables/useValidation'
import { isPositiveInteger } from '@/utils/validators'

const VALID_ROOM_EXPORT_STATUSES = ['available', 'occupied']

export function useExportRoomValidation() {
    const rules = {
        room_status: [
            v => {
                if (!v || String(v).trim().toLowerCase() === 'all') {
                    return { valid: true, message: '' }
                }
                const normalized = String(v).trim().toLowerCase()
                if (!VALID_ROOM_EXPORT_STATUSES.includes(normalized)) {
                    return {
                        valid: false,
                        message: 'Invalid room status filter.'
                    }
                }
                return { valid: true, message: '' }
            }
        ],
        room_type: [
            v => {
                if (v === null || v === undefined || v === '') {
                    return { valid: true, message: '' }
                }
                return isPositiveInteger(v, 'Room Type')
            }
        ],
        floors: [
            v => {
                if (v === null || v === undefined || v === '') {
                    return { valid: true, message: '' }
                }
                return isPositiveInteger(v, 'Floor')
            }
        ]
    }

    return useValidation(rules)
}