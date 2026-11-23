import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useBookingStore } from '@/stores/bookingStore';
import { sanitizeExportBookingParams } from '@/utils/sanitizers';

export function useAdminBooking() {
    const bookingStore = useBookingStore()
    const router = useRouter()

    const {
        bookingsMap,
        bookings,
        isFetching,
        isMutating,
        isExporting,
        error,
        validationErrors,
        totalCount,
        totalBookings,
        bookingDetails
    } = storeToRefs(bookingStore)

    async function exportBookings(rawParams = {}) {
        const cleanPayload = sanitizeExportBookingParams(rawParams)
        return bookingStore.exportBookings(cleanPayload)
    }

    function navigateToDetail(id) {
        router.push({ name: 'admin-booking-detail', params: { id } })
    }

    return {
        bookingsMap,
        bookings,
        isFetching,
        isMutating,
        isExporting,
        error,
        validationErrors,
        totalCount,
        totalBookings,
        bookingDetails,

        fetchBookings: bookingStore.fetchBookings,
        fetchBookingDetails: bookingStore.fetchBookingDetails,
        approveBookings: bookingStore.approveBookings,
        rejectBookings: bookingStore.rejectBookings,
        exportBookings,
        clearError: bookingStore.clearError,
        clearValidationErrors: bookingStore.clearValidationErrors,
        clearCache: bookingStore.clearCache,

        navigateToDetail
    }
}