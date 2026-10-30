import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useBookingStore } from '@/stores/bookingStore';

export function useAdminBooking() {
    const bookingStore = useBookingStore()
    const router = useRouter()

    const {
        bookingsMap,
        bookings,
        isFetching,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalBookings,
        bookingDetails
    } = storeToRefs(bookingStore)

    function navigateToDetail(id) {
        router.push({ name: 'admin-booking-detail', params: { id } })
    }

    return {
        bookingsMap,
        bookings,
        isFetching,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalBookings,
        bookingDetails,

        fetchBookings: bookingStore.fetchBookings,
        fetchBookingDetails: bookingStore.fetchBookingDetails,
        approveBookings: bookingStore.approveBookings,
        rejectBookings: bookingStore.rejectBookings,
        clearError: bookingStore.clearError,
        clearValidationErrors: bookingStore.clearValidationErrors,
        clearCache: bookingStore.clearCache,

        navigateToDetail
    }
}