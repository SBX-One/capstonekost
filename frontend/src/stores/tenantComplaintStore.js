import { defineStore } from 'pinia';
import { ref, computed, toRaw } from 'vue';
import apiClient from '@/services/api';

export const useTenantComplaintStore = defineStore('tenantComplaint', () => {
    let listController = null;
    let formRoomsController = null;

    const issuesMap = ref(new Map());
    const issueDetails = ref(new Map());
    const activeRooms = ref([]);
    const listCache = new Map();

    const isFetching = ref(false);
    const isFetchingDetail = ref(false);
    const isFetchingFormRooms = ref(false);
    const isMutating = ref(false);
    const error = ref(null);
    const validationErrors = ref({});
    const totalCount = ref(0);

    const issues = computed(() => Array.from(issuesMap.value.values()));
    const totalIssues = computed(() => issuesMap.value.size);

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
        issueDetails.value.clear();
        activeRooms.value = [];
    }

    function clearError() {
        error.value = null;
    }

    function clearValidationErrors() {
        validationErrors.value = {};
    }

    async function fetchIssues(page, params = {}) {
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

            issuesMap.value = newMap;
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
            const rawParams = {
                page: effectivePage,
                per_page: limit,
                filter: normalizedFilter || undefined,
            };

            const cleanParams = Object.fromEntries(
                Object.entries(rawParams).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
            );

            const response = await apiClient.get('/tenant/issues', {
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

            issuesMap.value = newMap;

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
            error.value = err.response?.data?.message || 'Failed to fetch complaint records.';
        } finally {
            if (listController === activeListController) {
                isFetching.value = false;
            }
        }
    }

    async function fetchIssueDetails(payloadIds) {
        const validNumericIds = getValidNumericIds(payloadIds);

        if (validNumericIds.length === 0) {
            error.value = 'Invalid complaint ID(s) provided.';
            return [];
        }

        const missingIds = validNumericIds.filter(id => !issueDetails.value.has(id));

        if (missingIds.length > 0) {
            isFetchingDetail.value = true;
            error.value = null;

            try {
                const response = await apiClient.get('/tenant/issues/detail', {
                    params: { id: missingIds },
                });

                const responseData = response.data;
                const fetchedList = Array.isArray(responseData.data)
                    ? responseData.data
                    : (Array.isArray(responseData) ? responseData : []);

                const nextDetailsMap = new Map(issueDetails.value);

                fetchedList.forEach(item => {
                    const detailData = item.issues_information ? item : (item.data || item);
                    const detailId = getValidNumericId(detailData?.id);

                    if (detailId) {
                        if (nextDetailsMap.size >= 50 && !nextDetailsMap.has(detailId)) {
                            const firstKey = nextDetailsMap.keys().next().value;
                            nextDetailsMap.delete(firstKey);
                        }

                        nextDetailsMap.set(detailId, structuredClone(toRaw(detailData)));
                    }
                });

                issueDetails.value = nextDetailsMap;
            } catch (err) {
                error.value = err.response?.data?.message || 'Failed to fetch complaint details.';
            } finally {
                isFetchingDetail.value = false;
            }
        }

        return validNumericIds
            .map(id => issueDetails.value.get(id))
            .filter(Boolean);
    }

    async function fetchActiveRooms(forceRefresh = false) {
        if (!forceRefresh && activeRooms.value.length > 0) {
            return activeRooms.value;
        }

        formRoomsController?.abort();
        const activeFormRoomsController = new AbortController();
        formRoomsController = activeFormRoomsController;

        isFetchingFormRooms.value = true;
        error.value = null;

        try {
            const response = await apiClient.get('/tenant/issues/form', {
                signal: activeFormRoomsController.signal,
            });

            const responseData = response.data;
            const list = Array.isArray(responseData.data)
                ? responseData.data
                : (Array.isArray(responseData) ? responseData : []);

            activeRooms.value = list;
            return list;
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return [];
            }
            error.value = err.response?.data?.message || 'Failed to fetch active rooms.';
            return [];
        } finally {
            if (formRoomsController === activeFormRoomsController) {
                isFetchingFormRooms.value = false;
            }
        }
    }

    async function createIssue(issueData) {
        if (isMutating.value) return false;

        isMutating.value = true;
        error.value = null;
        validationErrors.value = {};

        try {
            await apiClient.post('/tenant/issues', issueData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            listCache.clear();
            return true;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to submit complaint.';
            validationErrors.value = extractValidationErrors(err);
            return false;
        } finally {
            isMutating.value = false;
        }
    }

    return {
        issuesMap,
        issues,
        issueDetails,
        activeRooms,
        isFetching,
        isFetchingDetail,
        isFetchingFormRooms,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalIssues,

        fetchIssues,
        fetchIssueDetails,
        fetchActiveRooms,
        createIssue,
        clearError,
        clearValidationErrors,
        clearCache,
    };
});