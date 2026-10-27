import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/services/api';

export function useAdminBooking() {
    const router = useRouter();
    let controller = null

    const bookingsMap = ref(new Map())
    const isFetching = ref(false)
    const isMutating = ref(false)
    const error = ref(null)
    const totalCount = ref(0)

    const bookings = computed(() => Array.from(bookingsMap.value.values()))
    const totalBookings = computed(() => bookingsMap.value.size)

    async function fetchBookings(page, params = {}) {
        const effectivePage = parseInt(page || params.page, 10) || 1
        const limit = parseInt(params.limit, 10) || 10

        controller?.abort()
        const currentController = new AbortController()
        controller = currentController

        isFetching.value = true
        error.value = null

        try {
            const rawParams = {
                page: effectivePage,
                per_page: limit,
                search: params.search || undefined,
                status: params.status || undefined,
            };

            const cleanParams = Object.fromEntries(
                Object.entries(rawParams).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
            );

            const response = await apiClient.get('/admin/bookings', {
                params: cleanParams,
                signal: currentController.signal,
            });

            const responseData = response.data;
            const rawList = Array.isArray(responseData.data)
                ? responseData.data
                : (Array.isArray(responseData) ? responseData : []);

            const newMap = new Map();
            rawList.forEach((booking) => {
                if (booking && booking.id) {
                    newMap.set(booking.id, booking)
                }
            });

            bookingsMap.value = newMap

            const metaTotal = responseData.meta?.total ?? response.headers?.['x-total-count']
            totalCount.value = metaTotal !== undefined ? parseInt(metaTotal, 10) : rawList.length
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return;
            }
            error.value = err.response?.data?.message || 'Failed to fetch bookings data'
        } finally {
            if (controller === currentController) {
                isFetching.value = false
            }
        }
    }

    function navigateToDetail(id) {
        router.push({ name: 'admin-booking-detail', params: { id } })
    }

    function clearError() {
        error.value = null
    }

    return {
        bookings,
        isFetching,
        isMutating,
        error,
        totalCount,
        totalBookings,

        fetchBookings,
        navigateToDetail,
        clearError
    };
}