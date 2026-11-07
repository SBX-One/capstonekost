import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useTenantBookingStore } from '@/stores/tenantBookingStore';

export function useTenantBooking() {
    const tenantBookingStore = useTenantBookingStore()
    const router = useRouter()

    const {
        recentBooking,
        historyBookingsMap,
        historyBookings,
        isFetching,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalHistoryBookings,
        bookingDetails
    } = storeToRefs(tenantBookingStore)

    function navigateToRoomDetail(roomId) {
        router.push({ name: 'tenant-room-detail', params: { id: roomId } })
    }

    return {
        recentBooking,
        historyBookingsMap,
        historyBookings,
        isFetching,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalHistoryBookings,
        bookingDetails,

        fetchBookings: tenantBookingStore.fetchBookings,
        fetchBookingDetails: tenantBookingStore.fetchBookingDetails,
        submitBooking: tenantBookingStore.submitBooking,
        cancelBooking: tenantBookingStore.cancelBooking,
        clearError: tenantBookingStore.clearError,
        clearValidationErrors: tenantBookingStore.clearValidationErrors,
        clearCache: tenantBookingStore.clearCache,

        navigateToRoomDetail
    }
}