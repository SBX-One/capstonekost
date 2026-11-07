import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import apiClient from '@/services/api';
import { immutableSet } from '@/utils/mapUtils';

export const useTenantBookingStore = defineStore('tenantBooking', () => {
    let controller = null;
    const listCache = new Map();
    const bookingDetails = ref(new Map());

    const recentBooking = ref(null);
    const historyBookingsMap = ref(new Map());

    const isFetching = ref(false);
    const isMutating = ref(false);
    const error = ref(null);
    const validationErrors = ref({});
    const totalCount = ref(0);

    const historyBookings = computed(() => Array.from(historyBookingsMap.value.values()));
    const totalHistoryBookings = computed(() => historyBookingsMap.value.size);

    function getValidNumericIds(payloadIds) {
        const idArray = Array.isArray(payloadIds) ? payloadIds : [payloadIds];
        return idArray.reduce((acc, item) => {
            if (typeof item === 'number' || typeof item === 'string') {
                const num = Number(item);
                if (Number.isInteger(num) && num > 0) acc.push(num);
            }
            return acc;
        }, []);
    }

    function extractValidationErrors(err) {
        const data = err.response?.data;
        if (!data) return {};
        if (data.errors && typeof data.errors === 'object') return data.errors;
        if (data.fields && typeof data.fields === 'object') return data.fields;
        return {};
    }

    function clearCache() {
        listCache.clear();
        bookingDetails.value.clear();
    }

    function formatBookingPayload(formData) {
        return {
            move_in: formData.move_in,
            move_out: formData.move_out,
            rental_duration: parseInt(formData.rental_duration, 10),
            name: formData.name,
            email: formData.email,
            phone: formData.phone
        };
    }

    async function fetchBookings(page, params = {}) {
        const effectivePage = parseInt(page || params.page, 10) || 1;
        const limit = parseInt(params.limit, 10) || 5;
        const safeSearch = params.search || '';

        const cacheKey = `page-${effectivePage}-limit-${limit}-search-${safeSearch}`;

        if (listCache.has(cacheKey)) {
            const cached = listCache.get(cacheKey)
            recentBooking.value = cached.recent

            const newMap = new Map()
            cached.historyList.forEach((booking) => {
                if (booking && booking.id) {
                    newMap.set(booking.id, booking)
                }
            })

            historyBookingsMap.value = newMap
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
                search: safeSearch || undefined,
            }

            const cleanParams = Object.fromEntries(
                Object.entries(rawParams).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
            )

            const response = await apiClient.get('/tenant/bookings', {
                params: cleanParams,
                signal: currentController.signal,
            })

            const responseData = response.data?.data || {};
            recentBooking.value = responseData.recent_booking || null;

            const historyPaginated = responseData.history_bookings || {};
            const rawHistoryList = Array.isArray(historyPaginated.data)
                ? historyPaginated.data
                : [];

            const newMap = new Map();
            rawHistoryList.forEach((booking) => {
                if (booking && booking.id) {
                    newMap.set(booking.id, booking);
                }
            })

            historyBookingsMap.value = newMap;

            const metaTotal = historyPaginated.meta?.total ?? historyPaginated.total ?? response.headers?.['x-total-count'];
            totalCount.value = metaTotal !== undefined ? parseInt(metaTotal, 10) : rawHistoryList.length;

            if (listCache.size >= 50) {
                const firstKey = listCache.keys().next().value;
                listCache.delete(firstKey);
            }

            if (rawHistoryList.length > 0 || recentBooking.value) {
                listCache.set(cacheKey, {
                    recent: recentBooking.value,
                    historyList: rawHistoryList,
                    total: totalCount.value,
                });
            }

        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return
            }
            error.value = err.response?.data?.message || 'Failed to fetch your booking history.';
        } finally {
            if (controller === currentController) {
                isFetching.value = false;
            }
        }
    }

    async function fetchBookingDetails(payloadIds) {
        const validNumericIds = getValidNumericIds(payloadIds);

        if (validNumericIds.length === 0) {
            error.value = 'Invalid booking ID(s) provided';
            return []
        }

        const missingIds = validNumericIds.filter(id => !bookingDetails.value.has(id));

        if (missingIds.length > 0) {
            isFetching.value = true;
            error.value = null;

            try {
                const response = await apiClient.get('/tenant/rooms/book/detail', {
                    params: { id: missingIds }
                })

                const responseData = response.data;
                const fetchedList = Array.isArray(responseData.data)
                    ? responseData.data
                    : (Array.isArray(responseData) ? responseData : []);

                const nextDetailsMap = new Map(bookingDetails.value);

                fetchedList.forEach(item => {
                    const detailData = item.booking_record ? item : (item.data || item)

                    if (detailData && detailData.booking_record && detailData.booking_record.id) {
                        const bookingId = detailData.booking_record.id;

                        if (nextDetailsMap.size >= 50 && !nextDetailsMap.has(bookingId)) {
                            const firstKey = nextDetailsMap.keys().next().value;
                            nextDetailsMap.delete(firstKey);
                        }

                        nextDetailsMap.set(bookingId, structuredClone(toRaw(detailData)));
                    }
                });

                bookingDetails.value = nextDetailsMap
            } catch (err) {
                error.value = err.response?.data?.message || 'Failed to fetch booking details.';
            } finally {
                isFetching.value = false;
            }
        }

        return validNumericIds
            .map(id => bookingDetails.value.get(id))
            .filter(Boolean);
    }

    async function submitBooking(roomId, bookingData) {
        if (!roomId) {
            error.value = 'Room ID is required to create a booking.';
            return false;
        }

        if (isMutating.value) return false;

        isMutating.value = true;
        error.value = null;
        validationErrors.value = {};

        try {
            const formattedPayload = formatBookingPayload(bookingData);

            await apiClient.post(`/tenant/rooms/book/${roomId}`, formattedPayload);

            clearCache();
            return true;
        } catch (err) {
            if (err.response?.status === 409) {
                error.value = err.response?.data?.message || 'This room is already booked for the selected dates.';
            } else {
                error.value = err.response?.data?.message || 'Failed to submit booking request.';
            }

            validationErrors.value = extractValidationErrors(err);
            return false;
        } finally {
            isMutating.value = false;
        }
    }

    async function cancelBooking(id, cancelReason) {
        const numericId = parseInt(id, 10);
        if (!numericId || numericId <= 0) {
            error.value = 'Invalid booking ID provided for cancellation.';
            return false;
        }
        if (!cancelReason || cancelReason.trim() === '') {
            error.value = 'Cancellation reason is required.';
            return false;
        }

        if (isMutating.value) return false;
        isMutating.value = true;
        error.value = null;
        validationErrors.value = {};

        const isRecent = recentBooking.value?.id === numericId;
        const backupRecent = isRecent ? structuredClone(toRaw(recentBooking.value)) : null;

        const backupHistory = historyBookingsMap.value.has(numericId)
            ? structuredClone(toRaw(historyBookingsMap.value.get(numericId)))
            : null;

        const backupDetail = bookingDetails.value.has(numericId)
            ? structuredClone(toRaw(bookingDetails.value.get(numericId)))
            : null;

        if (isRecent && recentBooking.value.booking_records) {
            recentBooking.value.booking_records.status = 'cancelled';
        } else if (backupHistory) {
            const cloned = structuredClone(backupHistory);
            cloned.booking_records.status = 'cancelled';
            historyBookingsMap.value = immutableSet(historyBookingsMap.value, numericId, cloned);
        }

        if (backupDetail) {
            const cloned = structuredClone(backupDetail);
            cloned.booking_record.status = 'cancelled';
            bookingDetails.value = immutableSet(bookingDetails.value, numericId, cloned);
        }

        try {
            await apiClient.post(`/tenant/rooms/book/cancel/${numericId}`, {
                reason: cancelReason
            });
            clearCache()
            return true
        } catch (err) {
            if (isRecent) recentBooking.value = backupRecent;
            if (backupHistory) historyBookingsMap.value = immutableSet(historyBookingsMap.value, numericId, backupHistory);
            if (backupDetail) bookingDetails.value = immutableSet(bookingDetails.value, numericId, backupDetail);

            error.value = err.response?.data?.message || 'Failed to cancel the booking.';
            validationErrors.value = extractValidationErrors(err);
            return false;
        } finally {
            isMutating.value = false;
        }
    }

    function clearError() {
        error.value = null
    }

    function clearValidationErrors() {
        validationErrors.value = {}
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

        fetchBookings,
        fetchBookingDetails,
        submitBooking,
        cancelBooking,
        clearError,
        clearValidationErrors,
        clearCache
    }
})