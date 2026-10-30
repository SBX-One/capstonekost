import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import apiClient from '@/services/api';

export const useBookingStore = defineStore('booking', () => {
    let controller = null

    const bookingsMap = ref(new Map())
    const isFetching = ref(false)
    const isMutating = ref(false)
    const error = ref(null)
    const validationErrors = ref({})
    const totalCount = ref(0)

    const listCache = new Map()
    const bookingDetails = ref(new Map())

    const bookings = computed(() => Array.from(bookingsMap.value.values()))
    const totalBookings = computed(() => bookingsMap.value.size)

    function getValidNumericIds(payloadIds) {
        const idArray = Array.isArray(payloadIds) ? payloadIds : [payloadIds]
        return idArray.reduce((acc, item) => {
            if (typeof item === 'number' || typeof item === 'string') {
                const num = Number(item)
                if (Number.isInteger(num) && num > 0) {
                    acc.push(num)
                }
            }
            return acc
        }, [])
    }

    function extractValidationErrors(err) {
        const data = err.response?.data
        if (!data) return {}
        if (data.errors && typeof data.errors === 'object') return data.errors
        if (data.fields && typeof data.fields === 'object') return data.fields
        return {}
    }

    function clearCache() {
        listCache.clear()
        bookingDetails.value.clear()
    }

    async function fetchBookings(page, params = {}) {
        const effectivePage = parseInt(page || params.page, 10) || 1
        const limit = parseInt(params.limit, 10) || 10

        const cacheKey = `page-${effectivePage}-limit-${limit}-search-${params.search || ''}-status-${params.status || ''}`

        if (listCache.has(cacheKey)) {
            const cached = listCache.get(cacheKey)
            const newMap = new Map()

            cached.list.forEach((booking) => {
                if (booking && booking.id) {
                    newMap.set(booking.id, booking)
                }
            })

            bookingsMap.value = newMap
            totalCount.value = cached.total
            isFetching.value = false
            return
        }

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
            }

            const cleanParams = Object.fromEntries(
                Object.entries(rawParams).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
            )

            const response = await apiClient.get('/admin/bookings', {
                params: cleanParams,
                signal: currentController.signal,
            })

            const responseData = response.data
            const rawList = Array.isArray(responseData.data)
                ? responseData.data
                : (Array.isArray(responseData) ? responseData : [])

            const newMap = new Map()
            rawList.forEach((booking) => {
                if (booking && booking.id) {
                    newMap.set(booking.id, booking)
                }
            })

            bookingsMap.value = newMap

            const metaTotal = responseData.meta?.total ?? response.headers?.['x-total-count']
            totalCount.value = metaTotal !== undefined ? parseInt(metaTotal, 10) : rawList.length

            if (listCache.size >= 50) {
                const firstKey = listCache.keys().next().value
                listCache.delete(firstKey)
            }

            if (rawList.length > 0) {
                listCache.set(cacheKey, {
                    list: rawList,
                    total: totalCount.value,
                })
            }

        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return
            }
            error.value = err.response?.data?.message || 'Failed to fetch bookings data'
        } finally {
            if (controller === currentController) {
                isFetching.value = false
            }
        }
    }

    async function fetchBookingDetails(payloadIds) {
        const validNumericIds = getValidNumericIds(payloadIds)

        if (validNumericIds.length === 0) {
            error.value = 'Invalid booking ID(s) provided'
            return []
        }

        const missingIds = validNumericIds.filter(id => !bookingDetails.value.has(id))

        if (missingIds.length > 0) {
            isFetching.value = true
            error.value = null

            try {
                const response = await apiClient.get('/admin/bookings/detail', {
                    params: { id: missingIds }
                })

                const responseData = response.data
                const fetchedList = Array.isArray(responseData.data)
                    ? responseData.data
                    : (Array.isArray(responseData) ? responseData : [])

                const nextDetailsMap = new Map(bookingDetails.value)

                fetchedList.forEach(item => {
                    const detailData = item.booking_record ? item : (item.data || item)

                    if (detailData && detailData.booking_record && detailData.booking_record.id) {
                        const bookingId = detailData.booking_record.id

                        if (nextDetailsMap.size >= 50 && !nextDetailsMap.has(bookingId)) {
                            const firstKey = nextDetailsMap.keys().next().value
                            nextDetailsMap.delete(firstKey)
                        }

                        nextDetailsMap.set(bookingId, structuredClone(toRaw(detailData)))
                    }
                })

                bookingDetails.value = nextDetailsMap
            } catch (err) {
                error.value = err.response?.data?.message || 'Failed to fetch booking details'
            } finally {
                isFetching.value = false
            }
        }

        return validNumericIds
            .map(id => bookingDetails.value.get(id))
            .filter(Boolean)
    }

    async function approveBookings(payloadIds) {
        const validNumericIds = getValidNumericIds(payloadIds)

        if (validNumericIds.length === 0) {
            const isMultiple = Array.isArray(payloadIds) && payloadIds.length > 1
            error.value = `Invalid booking ${isMultiple ? 'IDs' : 'ID'} provided`
            return false
        }

        if (isMutating.value) return false
        isMutating.value = true
        error.value = null
        validationErrors.value = {}

        const backupBookings = []
        const backupDetails = []

        validNumericIds.forEach(id => {
            if (bookingsMap.value.has(id)) {
                backupBookings.push(structuredClone(toRaw(bookingsMap.value.get(id))))
            }
            if (bookingDetails.value.has(id)) {
                backupDetails.push(structuredClone(toRaw(bookingDetails.value.get(id))))
            }
        })

        const nextBookingsMap = new Map(bookingsMap.value)
        const nextDetailsMap = new Map(bookingDetails.value)

        validNumericIds.forEach(id => {
            if (nextBookingsMap.has(id)) {
                const clonedBooking = structuredClone(toRaw(nextBookingsMap.get(id)))
                clonedBooking.booking_records.status = 'approved'
                nextBookingsMap.set(id, clonedBooking)
            }
            if (nextDetailsMap.has(id)) {
                const clonedDetail = structuredClone(toRaw(nextDetailsMap.get(id)))
                clonedDetail.booking_record.status = 'approved'
                nextDetailsMap.set(id, clonedDetail)
            }
        })

        bookingsMap.value = nextBookingsMap
        bookingDetails.value = nextDetailsMap

        try {
            await apiClient.post('/admin/rooms/bookings/approve', {
                id: validNumericIds
            })
            return true
        } catch (err) {
            const restoredBookingsMap = new Map(bookingsMap.value)
            backupBookings.forEach(booking => restoredBookingsMap.set(booking.id, booking))
            bookingsMap.value = restoredBookingsMap

            const restoredDetailsMap = new Map(bookingDetails.value)
            backupDetails.forEach(detail => restoredDetailsMap.set(detail.booking_record.id, detail))
            bookingDetails.value = restoredDetailsMap

            error.value = err.response?.data?.message || 'Failed to approve bookings.'
            validationErrors.value = extractValidationErrors(err)
            return false
        } finally {
            isMutating.value = false
        }
    }

    async function rejectBookings(payloadIds, rejectReason) {
        const validNumericIds = getValidNumericIds(payloadIds)

        if (validNumericIds.length === 0) {
            const isMultiple = Array.isArray(payloadIds) && payloadIds.length > 1
            error.value = `Invalid booking ${isMultiple ? 'IDs' : 'ID'} provided`
            return false
        }

        if (!rejectReason || rejectReason.trim() === '') {
            error.value = 'Rejection reason is required'
            return false
        }

        if (isMutating.value) return false
        isMutating.value = true
        error.value = null
        validationErrors.value = {}

        const reasonArray = Array(validNumericIds.length).fill(rejectReason)

        const backupBookings = []
        const backupDetails = []

        validNumericIds.forEach(id => {
            if (bookingsMap.value.has(id)) {
                backupBookings.push(structuredClone(toRaw(bookingsMap.value.get(id))))
            }
            if (bookingDetails.value.has(id)) {
                backupDetails.push(structuredClone(toRaw(bookingDetails.value.get(id))))
            }
        })

        const nextBookingsMap = new Map(bookingsMap.value)
        const nextDetailsMap = new Map(bookingDetails.value)

        validNumericIds.forEach(id => {
            if (nextBookingsMap.has(id)) {
                const clonedBooking = structuredClone(toRaw(nextBookingsMap.get(id)))
                clonedBooking.booking_records.status = 'rejected'
                nextBookingsMap.set(id, clonedBooking)
            }
            if (nextDetailsMap.has(id)) {
                const clonedDetail = structuredClone(toRaw(nextDetailsMap.get(id)))
                clonedDetail.booking_record.status = 'rejected'
                nextDetailsMap.set(id, clonedDetail)
            }
        })

        bookingsMap.value = nextBookingsMap
        bookingDetails.value = nextDetailsMap

        try {
            await apiClient.post('/admin/rooms/bookings/reject', {
                id: validNumericIds,
                reason: reasonArray
            })
            return true
        } catch (err) {
            const restoredBookingsMap = new Map(bookingsMap.value)
            backupBookings.forEach(booking => restoredBookingsMap.set(booking.id, booking))
            bookingsMap.value = restoredBookingsMap

            const restoredDetailsMap = new Map(bookingDetails.value)
            backupDetails.forEach(detail => restoredDetailsMap.set(detail.booking_record.id, detail))
            bookingDetails.value = restoredDetailsMap

            error.value = err.response?.data?.message || 'Failed to reject bookings.'
            validationErrors.value = extractValidationErrors(err)
            return false
        } finally {
            isMutating.value = false
        }
    }

    function clearError() {
        error.value = null
    }

    function clearValidationErrors() {
        validationErrors.value = {}
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

        fetchBookings,
        fetchBookingDetails,
        approveBookings,
        rejectBookings,
        clearError,
        clearValidationErrors,
        clearCache
    }
})