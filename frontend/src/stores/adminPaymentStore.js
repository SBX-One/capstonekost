import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import apiClient from '@/services/api';

export const useAdminPaymentStore = defineStore('adminPayment', () => {
    let listController = null;
    let bookingsController = null;

    const paymentsMap = ref(new Map());
    const paymentDetails = ref(new Map());
    const recordableBookings = ref([]);
    const listCache = new Map();

    const isFetching = ref(false);
    const isFetchingDetail = ref(false);
    const isFetchingBookings = ref(false);
    const isMutating = ref(false);
    const isExporting = ref(false);
    const error = ref(null);
    const validationErrors = ref({});
    const totalCount = ref(0);

    const payments = computed(() => Array.from(paymentsMap.value.values()));
    const totalPayments = computed(() => paymentsMap.value.size);

    function getValidNumericId(id) {
        if (typeof id === 'number' || typeof id === 'string') {
            const num = Number(id);
            if (Number.isInteger(num) && num > 0) {
                return num;
            }
        }
        return null;
    }

    function getValidNumericIds(payloadIds) {
        const idArray = Array.isArray(payloadIds) ? payloadIds : [payloadIds];
        return idArray.reduce((acc, item) => {
            const num = getValidNumericId(item);
            if (num) acc.push(num);
            return acc;
        }, []);
    }

    function extractValidationErrorsFromObject(data) {
        if (!data || typeof data !== 'object') return {};
        if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) return data.errors;
        if (data.error && typeof data.error === 'object' && !Array.isArray(data.error)) return data.error;
        if (data.fields && typeof data.fields === 'object' && !Array.isArray(data.fields)) return data.fields;
        return {};
    }

    function extractValidationErrors(err) {
        return extractValidationErrorsFromObject(err.response?.data);
    }

    async function parseBlobJsonError(blob, fallbackMessage = 'Failed to export payment records.') {
        try {
            const rawText = await blob.text();
            const parsed = JSON.parse(rawText);
            return {
                message: parsed?.message || fallbackMessage,
                fields: extractValidationErrorsFromObject(parsed),
            };
        } catch {
            return {
                message: fallbackMessage,
                fields: {},
            };
        }
    }

    async function parseExportError(err) {
        const responseData = err.response?.data;
        if (responseData instanceof Blob) {
            return parseBlobJsonError(responseData);
        }

        return {
            message: responseData?.message || 'Failed to export payment records.',
            fields: extractValidationErrors(err),
        };
    }

    function extractFilenameFromHeader(dispositionHeader, fallback = 'payments.csv') {
        if (!dispositionHeader || typeof dispositionHeader !== 'string') return fallback;
        const utfMatch = dispositionHeader.match(/filename\*=UTF-8''([^;]+)/i);
        if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].trim());

        const plainMatch = dispositionHeader.match(/filename="?([^";]+)"?/i);
        if (plainMatch?.[1]) return plainMatch[1].trim();

        return fallback;
    }

    function normalizeExportStatus(rawStatus) {
        if (!rawStatus || typeof rawStatus !== 'string') return undefined;
        const normalized = rawStatus.trim().toLowerCase();
        if (!normalized || normalized === 'all') return undefined;
        if (normalized === 'partial' || normalized === 'partially_paid') return 'partially paid';
        if (['unpaid', 'partially paid', 'paid'].includes(normalized)) return normalized;
        return undefined;
    }

    function clearCache() {
        listCache.clear();
        paymentDetails.value.clear();
        recordableBookings.value = [];
    }

    function clearError() {
        error.value = null;
    }

    function clearValidationErrors() {
        validationErrors.value = {};
    }

    async function fetchPayments(page, params = {}) {
        const effectivePage = parseInt(page || params.page, 10) || 1;
        const limit = parseInt(params.limit, 10) || 9;
        const cacheKey = `page-${effectivePage}-limit-${limit}`;

        if (listCache.has(cacheKey)) {
            const cached = listCache.get(cacheKey);
            const newMap = new Map();

            cached.list.forEach(item => {
                if (item && item.id) {
                    newMap.set(item.id, structuredClone(item));
                }
            });

            paymentsMap.value = newMap;
            totalCount.value = cached.total;
            isFetching.value = false;
            return;
        }

        listController?.abort();
        const activeListController = new AbortController();
        listController = activeListController;

        isFetching.value = true;
        error.value = null;

        try {
            const response = await apiClient.get('/admin/payments', {
                params: {
                    page: effectivePage,
                    per_page: limit,
                },
                signal: activeListController.signal,
            });

            const responseData = response.data;
            const rawList = Array.isArray(responseData.data)
                ? responseData.data
                : (Array.isArray(responseData) ? responseData : []);

            const newMap = new Map();
            rawList.forEach(item => {
                if (item && item.id) {
                    newMap.set(item.id, item);
                }
            });

            paymentsMap.value = newMap;

            const metaTotal =
                responseData.meta?.total ??
                responseData.data?.meta?.total ??
                response.headers?.['x-total-count'];
            totalCount.value = metaTotal !== undefined ? parseInt(metaTotal, 10) : rawList.length;

            if (listCache.size >= 50) {
                const firstKey = listCache.keys().next().value;
                listCache.delete(firstKey);
            }

            if (rawList.length > 0) {
                listCache.set(cacheKey, {
                    list: structuredClone(rawList),
                    total: totalCount.value,
                });
            }
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return;
            }
            error.value = err.response?.data?.message || 'Failed to fetch payment records.';
        } finally {
            if (listController === activeListController) {
                isFetching.value = false;
            }
        }
    }

    async function fetchPaymentDetails(payloadIds) {
        const validNumericIds = getValidNumericIds(payloadIds);

        if (validNumericIds.length === 0) {
            error.value = 'Invalid payment ID(s) provided.';
            return [];
        }

        const missingIds = validNumericIds.filter(id => !paymentDetails.value.has(id));

        if (missingIds.length > 0) {
            isFetchingDetail.value = true;
            error.value = null;

            try {
                const response = await apiClient.get('/admin/payments/detail', {
                    params: { id: missingIds },
                });

                const responseData = response.data;
                const fetchedList = Array.isArray(responseData.data)
                    ? responseData.data
                    : (Array.isArray(responseData) ? responseData : []);

                const nextDetailsMap = new Map(paymentDetails.value);

                fetchedList.forEach(item => {
                    const detailData = item.payment_record ? item : (item.data || item);
                    const detailId = getValidNumericId(detailData?.id ?? detailData?.payment_record?.id);

                    if (detailId) {
                        if (nextDetailsMap.size >= 50 && !nextDetailsMap.has(detailId)) {
                            const firstKey = nextDetailsMap.keys().next().value;
                            nextDetailsMap.delete(firstKey);
                        }

                        nextDetailsMap.set(detailId, structuredClone(toRaw(detailData)));
                    }
                });

                paymentDetails.value = nextDetailsMap;
            } catch (err) {
                error.value = err.response?.data?.message || 'Failed to fetch payment details.';
            } finally {
                isFetchingDetail.value = false;
            }
        }

        return validNumericIds
            .map(id => paymentDetails.value.get(id))
            .filter(Boolean);
    }

    async function fetchRecordableBookings(forceRefresh = false) {
        if (!forceRefresh && recordableBookings.value.length > 0) {
            return recordableBookings.value;
        }

        bookingsController?.abort();
        const activeBookingsController = new AbortController();
        bookingsController = activeBookingsController;

        isFetchingBookings.value = true;
        error.value = null;

        try {
            const response = await apiClient.get('/admin/payments/record', {
                signal: activeBookingsController.signal,
            });

            const responseData = response.data;
            const list = Array.isArray(responseData.data)
                ? responseData.data
                : (Array.isArray(responseData) ? responseData : []);

            recordableBookings.value = list;
            return list;
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return [];
            }
            error.value = err.response?.data?.message || 'Failed to fetch eligible bookings.';
            return [];
        } finally {
            if (bookingsController === activeBookingsController) {
                isFetchingBookings.value = false;
            }
        }
    }

    async function createPaymentRecord(payload) {
        if (isMutating.value) return false;

        isMutating.value = true;
        error.value = null;
        validationErrors.value = {};

        try {
            await apiClient.post('/admin/payments/record', payload);
            clearCache();
            return true;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to create payment record.';
            validationErrors.value = extractValidationErrors(err);
            return false;
        } finally {
            isMutating.value = false;
        }
    }

    async function exportPayments(params = {}) {
        if (isExporting.value) return null;

        isExporting.value = true;
        error.value = null;
        validationErrors.value = {};

        try {
            const numericRoomId = getValidNumericId(params.room_id);
            const rawParams = {
                start_date: params.start_date || undefined,
                end_date: params.end_date || undefined,
                status: normalizeExportStatus(params.status),
                room_id: numericRoomId || undefined,
            };

            const cleanParams = Object.fromEntries(
                Object.entries(rawParams).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
            );

            const response = await apiClient.get('/admin/payments/export', {
                params: cleanParams,
                responseType: 'blob',
            });

            if (response.data instanceof Blob && response.data.type?.includes('application/json')) {
                const parsedError = await parseBlobJsonError(response.data);
                error.value = parsedError.message;
                validationErrors.value = parsedError.fields;
                return null;
            }

            const filename = extractFilenameFromHeader(
                response.headers?.['content-disposition'],
                'payments.csv'
            );

            return {
                blob: response.data,
                filename,
            };
        } catch (err) {
            const parsedError = await parseExportError(err);
            error.value = parsedError.message;
            validationErrors.value = parsedError.fields;
            return null;
        } finally {
            isExporting.value = false;
        }
    }

    return {
        paymentsMap,
        payments,
        paymentDetails,
        recordableBookings,
        isFetching,
        isFetchingDetail,
        isFetchingBookings,
        isMutating,
        isExporting,
        error,
        validationErrors,
        totalCount,
        totalPayments,

        fetchPayments,
        fetchPaymentDetails,
        fetchRecordableBookings,
        createPaymentRecord,
        exportPayments,
        clearError,
        clearValidationErrors,
        clearCache,
    };
});