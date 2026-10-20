import { ref, computed } from 'vue';
import apiClient from '@/services/api';

export function useIsolatedTenantRooms() {
    const localRoomMap = ref(new Map());
    const localRooms = computed(() => Array.from(localRoomMap.value.values()));
    const totalCount = ref(0);

    const isLocalFetching = ref(false);
    const localError = ref(null);

    const localCache = new Map();
    let abortController = null;

    const fetchIsolatedRooms = async (params = {}) => {
        const limit = parseInt(params.limit || params.per_page, 10) || 6;
        const typeId = params.room_type || '';

        const cacheKey = `isolated-limit-${limit}-type-${typeId}`;

        if (localCache.has(cacheKey)) {
            const cached = localCache.get(cacheKey);
            const newMap = new Map();

            cached.list.forEach((room) => {
                if (room && room.id) {
                    newMap.set(room.id, room);
                }
            });

            localRoomMap.value = newMap;
            totalCount.value = cached.total;
            isLocalFetching.value = false;
            return;
        }

        abortController?.abort();
        const currentController = new AbortController();
        abortController = currentController;

        isLocalFetching.value = true;
        localError.value = null;

        try {
            const rawParams = {
                page: 1,
                per_page: limit,
                room_type: typeId || undefined,
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

            const newMap = new Map()
            rawList.forEach((room) => {
                if (room && room.id) {
                    newMap.set(room.id, room)
                }
            })

            localRoomMap.value = newMap;

            const metaTotal = responseData.meta?.total ?? response.headers?.['x-total-count'];
            totalCount.value = metaTotal !== undefined ? parseInt(metaTotal, 10) : rawList.length;

            if (localCache.size >= 50) {
                const firstKey = localCache.keys().next().value;
                localCache.delete(firstKey);
            }

            if (rawList.length > 0) {
                localCache.set(cacheKey, {
                    list: rawList,
                    total: totalCount.value,
                });
            }
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return;
            }

            localError.value = err.response?.data?.message || 'Failed to load isolated rooms';
        } finally {
            if (abortController === currentController) {
                isLocalFetching.value = false;
            }
        }
    };

    const abortIsolatedFetch = () => {
        abortController?.abort();
    };

    return {
        localRoomMap,
        localRooms,
        totalCount,
        isLocalFetching,
        localError,
        fetchIsolatedRooms,
        abortIsolatedFetch
    };
}