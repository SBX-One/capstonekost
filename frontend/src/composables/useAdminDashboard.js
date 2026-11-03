import { ref } from 'vue';
import apiClient from '@/services/api';
import { sanitizeNumber } from '@/utils/sanitizers';

export function useAdminDashboard() {
    const dashboardData = ref(null)
    const isLoading = ref(false)
    const error = ref(null)
    let controller = null

    const sanitizeObjectNumbers = (obj) => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {}
        return Object.keys(obj).reduce((acc, key) => {
            acc[key] = sanitizeNumber(obj[key], 0)
            return acc
        }, {})
    }

    const fetchDashboardData = async () => {
        controller?.abort()
        const currentController = new AbortController()
        controller = currentController

        isLoading.value = true
        error.value = null
        dashboardData.value = null

        try {
            const response = await apiClient.get('/admin/dashboard', {
                signal: currentController.signal
            })

            const responseData = response?.data?.data || null

            if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
                responseData.metrics = sanitizeObjectNumbers(responseData.metrics || {})
                responseData.room_occupancy = sanitizeObjectNumbers(responseData.room_occupancy || {})
                responseData.booking_status_overview = sanitizeObjectNumbers(responseData.booking_status_overview || {})

                responseData.recent_bookings = Array.isArray(responseData.recent_bookings)
                    ? responseData.recent_bookings
                    : []
            }

            dashboardData.value = responseData

        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return
            }
            error.value = err.response?.data?.message || 'Failed to fetch dashboard data. Please try again.'
        } finally {
            if (controller === currentController) {
                isLoading.value = false
            }
        }
    }

    return {
        dashboardData,
        isLoading,
        error,
        fetchDashboardData
    }
}