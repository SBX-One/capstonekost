import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import apiClient from '@/services/api';
import { immutableSet } from '@/utils/mapUtils';

export const useTenantRoomStore = defineStore('tenantRoom', () => {
    let controller = null;

    const roomMap = ref(new Map());

    const isFetching = ref(false);
    const error = ref(null);
    const totalCount = ref(0);
    const cache = new Map();

    const rooms = computed(() => Array.from(roomMap.value.values()));
    const totalRooms = computed(() => roomMap.value.size);

    function clearCache() {
        cache.clear();
    }

    function getRoomById(id) {
        const numericId = Number(id)
        if (isNaN(numericId)) return undefined
        return roomMap.value.get(numericId)
    }

    async function fetchTenantRooms(page = 1, params = {}) {
        const effectivePage = parseInt(page || params.page, 10) || 1;
        const limit = parseInt(params.limit || params.per_page, 10) || 6;

        const facilitiesKey = Array.isArray(params.facilities)
            ? [...params.facilities].sort().join(',')
            : (params.facilities || '');

        const cacheKey = `page-${effectivePage}-limit-${limit}-search-${params.search || ''}-type-${params.room_type || ''}-floor-${params.floor || ''}-min-${params.min_price || ''}-max-${params.max_price || ''}-fac-${facilitiesKey}`;

        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey);
            const newMap = new Map();

            cached.list.forEach((room) => {
                if (room && room.id) {
                    newMap.set(room.id, room);
                }
            });

            roomMap.value = newMap;
            totalCount.value = cached.total;
            isFetching.value = false;
            return;
        }

        controller?.abort();
        const currentController = new AbortController();
        controller = currentController;

        isFetching.value = true;
        error.value = null;

        try {
            const rawParams = {
                page: effectivePage,
                per_page: limit,
                search: params.search || undefined,
                room_type: params.room_type || undefined,
                floor: params.floor || undefined,
                min_price: params.min_price || undefined,
                max_price: params.max_price || undefined,
                facilities: params.facilities || undefined,
            };

            const cleanParams = Object.fromEntries(
                Object.entries(rawParams).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
            );

            const response = await apiClient.get('/tenant/rooms', {
                params: cleanParams,
                signal: currentController.signal,
            });

            const responseData = response.data;
            const rawList = Array.isArray(responseData.data)
                ? responseData.data
                : (Array.isArray(responseData) ? responseData : []);

            const newMap = new Map();
            rawList.forEach((room) => {
                if (room && room.id) {
                    newMap.set(room.id, room);
                }
            });

            roomMap.value = newMap;

            const metaTotal = responseData.meta?.total ?? response.headers?.['x-total-count'];
            totalCount.value = metaTotal !== undefined ? parseInt(metaTotal, 10) : rawList.length;

            if (cache.size >= 50) {
                const firstKey = cache.keys().next().value;
                cache.delete(firstKey);
            }

            if (rawList.length > 0) {
                cache.set(cacheKey, {
                    list: rawList,
                    total: totalCount.value,
                });
            }
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return;
            }

            error.value = err.response?.data?.message || 'Failed to fetch rooms';
        } finally {
            if (controller === currentController) {
                isFetching.value = false;
            }
        }
    }

    async function fetchTenantRoomById(id) {
        const numericId = Number(id);
        if (isNaN(numericId) || numericId <= 0) {
            error.value = 'Invalid room ID';
            return null;
        }

        if (roomMap.value.has(numericId)) {
            return roomMap.value.get(numericId);
        }

        isFetching.value = true;
        error.value = null;

        try {
            const response = await apiClient.get(`/tenant/rooms/${numericId}`);
            const responseData = response.data;
            const roomData = Array.isArray(responseData.data)
                ? responseData.data[0]
                : (responseData.data || responseData);

            if (roomData && roomData.id) {
                roomMap.value = immutableSet(roomMap.value, roomData.id, roomData);
            }
            return roomData;
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch room details'
            return null;
        } finally {
            isFetching.value = false;
        }
    }

    return {
        roomMap,
        rooms,
        isFetching,
        error,
        totalCount,
        totalRooms,
        getRoomById,
        fetchTenantRooms,
        fetchTenantRoomById,
        clearCache,
    };
});