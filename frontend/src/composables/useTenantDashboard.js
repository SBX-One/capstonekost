import { ref } from 'vue';
import apiClient from '@/services/api';
import { sanitizeNumber } from '@/utils/sanitizers';

export function useTenantDashboard() {
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
            const response = await apiClient.get('/tenant/dashboard', {
                signal: currentController.signal
            })

            const responseData = response?.data?.data || null

            if (responseData && typeof responseData === 'object' && !Array.isArray(responseData)) {
                const rawMetrics = responseData.metrics || {}
                const sanitizedMetrics = sanitizeObjectNumbers(rawMetrics)

                sanitizedMetrics.this_month_bill_amount = Array.isArray(rawMetrics.this_month_bill) && rawMetrics.this_month_bill.length > 0
                    ? sanitizeNumber(rawMetrics.this_month_bill[0], 0)
                    : 0

                responseData.metrics = sanitizedMetrics

                responseData.booking_history = Array.isArray(responseData.booking_history)
                    ? responseData.booking_history
                    : []

                const rawPayment = responseData.payment_history || {}
                responseData.payment_history = {
                    total_amount_paid: sanitizeNumber(rawPayment.total_amount_paid, 0),
                    payments: Array.isArray(rawPayment.payments) ? rawPayment.payments : []
                };
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