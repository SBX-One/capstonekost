import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import apiClient from '@/services/api';
import { immutableSet } from '@/utils/mapUtils';

export const useTenantPaymentStore = defineStore('tenantPayment', () => {
    let listController = null;
    let currentController = null;

    const paymentsMap = ref(new Map());
    const currentPayments = ref(new Map());
    const listCache = new Map();

    const isFetching = ref(false);
    const isFetchingCurrent = ref(false);
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
        currentPayments.value.clear();
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
        const activeListController = new AbortController();
        listController = activeListController;

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
            if (listController === activeListController) {
                isFetching.value = false;
            }
        }
    }

    async function fetchCurrentPayment(id, forceRefresh = false) {
        const numericId = getValidNumericId(id);
        if (!numericId) {
            error.value = 'Invalid booking ID provided.';
            return null;
        }

        if (!forceRefresh && currentPayments.value.has(numericId)) {
            return currentPayments.value.get(numericId);
        }

        currentController?.abort();
        const activeCurrentController = new AbortController();
        currentController = activeCurrentController;

        isFetchingCurrent.value = true;
        error.value = null;

        try {
            const response = await apiClient.get(`/tenant/payments/current/${numericId}`, {
                signal: activeCurrentController.signal,
            });
            const responseData = response.data;
            const currentData = responseData.data || responseData;

            if (currentData) {
                if (currentPayments.value.size >= 50 && !currentPayments.value.has(numericId)) {
                    const firstKey = currentPayments.value.keys().next().value;
                    const nextMap = new Map(currentPayments.value);
                    nextMap.delete(firstKey);
                    currentPayments.value = nextMap;
                }

                currentPayments.value = immutableSet(currentPayments.value, numericId, currentData);
            }

            return currentData;
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return null;
            }
            error.value = err.response?.data?.message || 'Failed to fetch current payment details.';
            return null;
        } finally {
            if (currentController === activeCurrentController) {
                isFetchingCurrent.value = false;
            }
        }
    }

    async function confirmPaymentPlan(billingId, plan, currentBookingId = null) {
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

        const numericCurrentId = getValidNumericId(currentBookingId);
        const backupCurrent = numericCurrentId && currentPayments.value.has(numericCurrentId)
            ? structuredClone(toRaw(currentPayments.value.get(numericCurrentId)))
            : null;
        const backupListItem = numericCurrentId && paymentsMap.value.has(numericCurrentId)
            ? structuredClone(toRaw(paymentsMap.value.get(numericCurrentId)))
            : null;

        if (backupCurrent && backupCurrent.payment_record) {
            const optimisticCurrent = structuredClone(backupCurrent);
            optimisticCurrent.payment_record.payment_plan = normalizedPlan;
            currentPayments.value = immutableSet(currentPayments.value, numericCurrentId, optimisticCurrent);
        }

        if (backupListItem) {
            const optimisticItem = structuredClone(backupListItem);
            if (optimisticItem.payment_record) {
                optimisticItem.payment_record.payment_plan = normalizedPlan;
            } else if (optimisticItem.booking_record) {
                optimisticItem.booking_record.payment_plan = normalizedPlan;
            }
            paymentsMap.value = immutableSet(paymentsMap.value, numericCurrentId, optimisticItem);
        }

        try {
            await apiClient.patch('/tenant/payments/confirm', {
                billing_id: numericBillingId,
                plan: normalizedPlan,
            });

            listCache.clear();
            if (numericCurrentId) {
                await fetchCurrentPayment(numericCurrentId, true);
            }
            return true;
        } catch (err) {
            if (backupCurrent && numericCurrentId) {
                currentPayments.value = immutableSet(currentPayments.value, numericCurrentId, backupCurrent);
            }
            if (backupListItem && numericCurrentId) {
                paymentsMap.value = immutableSet(paymentsMap.value, numericCurrentId, backupListItem);
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
        currentPayments,
        isFetching,
        isFetchingCurrent,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalPayments,
        counts,

        fetchPayments,
        fetchCurrentPayment,
        confirmPaymentPlan,
        clearError,
        clearValidationErrors,
        clearCache,
    };
});