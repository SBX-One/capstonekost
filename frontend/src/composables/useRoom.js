import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/roomStore'

export function useRoom() {
    const roomStore = useRoomStore()
    const router = useRouter()

    const {
        roomMap,
        rooms,
        isFetching,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalRooms
    } = storeToRefs(roomStore)

    function navigateToCreate() {
        router.push({ name: 'admin-room-add' })
    }

    function navigateToEdit(id) {
        router.push({ name: 'admin-room-edit', params: { id } })
    }

    function formatRupiah(price) {
        if (!price) return 'Rp 0'
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(price)
    }

    return {
        roomMap,
        rooms,
        isFetching,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalRooms,

        fetchRooms: roomStore.fetchRooms,
        fetchRoomById: roomStore.fetchRoomById,
        createRoom: roomStore.createRoom,
        updateRoom: roomStore.updateRoom,
        deleteRoom: roomStore.deleteRoom,
        clearError: roomStore.clearError,
        clearValidationErrors: roomStore.clearValidationErrors,

        navigateToCreate,
        navigateToEdit,
        formatRupiah
    }
}