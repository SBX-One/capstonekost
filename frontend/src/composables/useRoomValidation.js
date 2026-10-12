import { useValidation } from '@/composables/useValidation'
import { required, isNumeric, minValue, maxLength } from '@/utils/validators'

export function useRoomValidation() {
    const rules = {
        name: [
            v => required(v, 'Room Name'),
            v => maxLength(v, 255, 'Room Name')
        ],
        room_type: [
            v => required(v, 'Room Type')
        ],
        floor: [
            v => required(v, 'Floor'),
            v => isNumeric(v, 'Floor')
        ],
        price: [
            v => required(v, 'Price'),
            v => isNumeric(v, 'Price'),
            v => minValue(v, 0, 'Price')
        ],
        description: [
            v => maxLength(v, 1000, 'Description')
        ]
    }

    return useValidation(rules)
}