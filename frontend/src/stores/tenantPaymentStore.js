import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import apiClient from '@/services/api';
import { immutableSet } from '@/utils/mapUtils';

export const useTenantPaymentStore = defineStore('tenantPayment', () => {
    let listController = null;
    let detailController = null;

    const paymentsMap = ref(new Map());
    const paymentDetails = ref(new Map());
    const listCache = new Map();

    const isFetching = ref(false);
    const isFetchingDetail = ref(false);
    const isMutating = ref(false);
    const error = ref(null);
    const validationErrors = ref({});
    const totalCount = ref(0);
    const counts = ref(0);

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

    function extractValidationErrors(err) {
        const data = err.response?.data;
        if (!data || typeof data !== 'object') return {};
        if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) return data.errors;
        if (data.error && typeof data.error === 'object' && !Array.isArray(data.error)) return data.error;
        if (data.fields && typeof data.fields === 'object' && !Array.isArray(data.fields)) return data.fields;
        return {};
    }

    function clearCache() {
        listCache.clear();
        paymentDetails.value.clear();
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
        const normalizedFilter = params.filter && params.filter !== 'all'
            ? String(params.filter).toLowerCase().trim()
            : '';

        const cacheKey = `page-${effectivePage}-limit-${limit}-filter-${normalizedFilter}`;

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
            counts.value = cached.counts;
            isFetching.value = false;
            return;
        }

        listController?.abort();
        const currentController = new AbortController();
        listController = currentController;

        isFetching.value = true;
        error.value = null;

        try {
            const rawParams = {
                page: effectivePage,
                per_page: limit,
                filter: normalizedFilter || undefined,
            };

            const cleanParams = Object.fromEntries(
                Object.entries(rawParams).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
            );

            const response = await apiClient.get('/tenant/payments', {
                params: cleanParams,
                signal: currentController.signal,
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

            const metaTotal = responseData.meta?.total ?? response.headers?.['x-total-count'];
            totalCount.value = metaTotal !== undefined ? parseInt(metaTotal, 10) : rawList.length;
            counts.value = responseData.counts !== undefined ? parseInt(responseData.counts, 10) : totalCount.value;

            if (listCache.size >= 50) {
                const firstKey = listCache.keys().next().value;
                listCache.delete(firstKey);
            }

            if (rawList.length > 0) {
                listCache.set(cacheKey, {
                    list: structuredClone(rawList),
                    total: totalCount.value,
                    counts: counts.value,
                });
            }
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return;
            }
            error.value = err.response?.data?.message || 'Failed to fetch payment records.';
        } finally {
            if (listController === currentController) {
                isFetching.value = false;
            }
        }
    }

    async function fetchPaymentDetail(id, forceRefresh = false) {
        const numericId = getValidNumericId(id);
        if (!numericId) {
            error.value = 'Invalid payment ID provided.';
            return null;
        }

        if (!forceRefresh && paymentDetails.value.has(numericId)) {
            return paymentDetails.value.get(numericId);
        }

        detailController?.abort();
        const currentController = new AbortController();
        detailController = currentController;

        isFetchingDetail.value = true;
        error.value = null;

        try {
            const response = await apiClient.get(`/tenant/payments/detail/${numericId}`, {
                signal: currentController.signal,
            });
            const responseData = response.data;
            const detailData = responseData.data || responseData;

            if (detailData) {
                if (paymentDetails.value.size >= 50 && !paymentDetails.value.has(numericId)) {
                    const firstKey = paymentDetails.value.keys().next().value;
                    const nextMap = new Map(paymentDetails.value);
                    nextMap.delete(firstKey);
                    paymentDetails.value = nextMap;
                }

                paymentDetails.value = immutableSet(paymentDetails.value, numericId, detailData);
            }

            return detailData;
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return null;
            }
            error.value = err.response?.data?.message || 'Failed to fetch payment details.';
            return null;
        } finally {
            if (detailController === currentController) {
                isFetchingDetail.value = false;
            }
        }
    }

    async function confirmPaymentPlan(billingId, plan, paymentListId = null) {
        const numericBillingId = getValidNumericId(billingId);
        if (!numericBillingId) {
            error.value = 'Invalid billing ID provided.';
            return false;
        }

        const normalizedPlan = typeof plan === 'string' ? plan.trim().toLowerCase() : '';
        if (!['monthly', 'full'].includes(normalizedPlan)) {
            error.value = 'Payment plan must be either monthly or full.';
            return false;
        }

        if (isMutating.value) return false;
        isMutating.value = true;
        error.value = null;
        validationErrors.value = {};

        const numericListId = getValidNumericId(paymentListId);
        const backupDetail = numericListId && paymentDetails.value.has(numericListId)
            ? structuredClone(toRaw(paymentDetails.value.get(numericListId)))
            : null;
        const backupListItem = numericListId && paymentsMap.value.has(numericListId)
            ? structuredClone(toRaw(paymentsMap.value.get(numericListId)))
            : null;

        if (backupDetail && backupDetail.payment_record) {
            const optimisticDetail = structuredClone(backupDetail);
            optimisticDetail.payment_record.payment_plan = normalizedPlan;
            paymentDetails.value = immutableSet(paymentDetails.value, numericListId, optimisticDetail);
        }

        if (backupListItem) {
            const optimisticItem = structuredClone(backupListItem);
            if (optimisticItem.payment_record) {
                optimisticItem.payment_record.payment_plan = normalizedPlan;
            } else if (optimisticItem.booking_record) {
                optimisticItem.booking_record.payment_plan = normalizedPlan;
            }
            paymentsMap.value = immutableSet(paymentsMap.value, numericListId, optimisticItem);
        }

        try {
            await apiClient.patch('/tenant/payments/confirm', {
                billing_id: numericBillingId,
                plan: normalizedPlan,
            });

            listCache.clear();
            return true;
        } catch (err) {
            if (backupDetail && numericListId) {
                paymentDetails.value = immutableSet(paymentDetails.value, numericListId, backupDetail);
            }
            if (backupListItem && numericListId) {
                paymentsMap.value = immutableSet(paymentsMap.value, numericListId, backupListItem);
            }

            error.value = err.response?.data?.message || 'Failed to confirm payment plan.';
            validationErrors.value = extractValidationErrors(err);
            return false;
        } finally {
            isMutating.value = false;
        }
    }

    return {
        paymentsMap,
        payments,
        paymentDetails,
        isFetching,
        isFetchingDetail,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalPayments,
        counts,

        fetchPayments,
        fetchPaymentDetail,
        confirmPaymentPlan,
        clearError,
        clearValidationErrors,
        clearCache,
    };
});