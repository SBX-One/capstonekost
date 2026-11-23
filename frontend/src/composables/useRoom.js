import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useRoomStore } from '@/stores/roomStore'
import { sanitizeExportRoomParams } from '@/utils/sanitizers'

export function useRoom() {
    const roomStore = useRoomStore()
    const router = useRouter()

    const {
        roomMap,
        rooms,
        isFetching,
        isMutating,
        isMutatingFacility,
        isExporting,
        error,
        validationErrors,
        totalCount,
        totalRooms
    } = storeToRefs(roomStore)

    async function exportRooms(rawParams = {}) {
        const cleanPayload = sanitizeExportRoomParams(rawParams)
        return roomStore.exportRooms(cleanPayload)
    }

    function navigateToCreate() {
        router.push({ name: 'admin-room-add' })
    }

    function navigateToEdit(id) {
        router.push({ name: 'admin-room-edit', params: { id } })
    }

    function formatRupiah(price) {
        if (!price && price !== 0) return 'Rp 0';
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
        isMutatingFacility,
        isExporting,
        error,
        validationErrors,
        totalCount,
        totalRooms,

        fetchRooms: roomStore.fetchRooms,
        fetchRoomById: roomStore.fetchRoomById,
        createRoom: roomStore.createRoom,
        updateRoom: roomStore.updateRoom,
        addFacility: roomStore.addFacility,
        deleteRoom: roomStore.deleteRoom,
        exportRooms,
        clearError: roomStore.clearError,
        clearValidationErrors: roomStore.clearValidationErrors,

        navigateToCreate,
        navigateToEdit,
        formatRupiah
    }
}