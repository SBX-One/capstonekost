import { useValidation } from '@/composables/useValidation'
import { required, isNumeric, minValue, maxLength, isAvifFile, maxFileSize } from '@/utils/validators'
import { useRoom } from '@/composables/useRoom'

export function useRoomValidation() {
    const { formatRupiah } = useRoom()

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
            v => {
                const result = minValue(v, 50000, 'Price')

                if (!result.valid) {
                    return {
                        valid: false,
                        message: `Price must be at least ${formatRupiah(50000)}.`
                    }
                }
                return result
            }
        ],
        overview: [
            v => required(v, 'Overview'),
            v => maxLength(v, 500, 'Overview')
        ],
        description: [
            v => required(v, 'Description'),
            v => maxLength(v, 1000, 'Description')
        ],
        rules: [
            v => required(v, 'Rules')
        ],
        facilities: [
            v => required(v, 'Facilities')
        ],
        image: [
            v => required(v, 'Room Image'),
            v => isAvifFile(v, 'Room Image'),
            v => maxFileSize(v, 5, 'Room Image')
        ]
    }

    return useValidation(rules)
}