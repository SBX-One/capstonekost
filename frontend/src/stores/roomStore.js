import { defineStore } from "pinia";
import { ref, computed, toRaw } from "vue";
import apiClient from "@/services/api";
import { immutableDelete, immutableSet } from "@/utils/mapUtils";

export const useRoomStore = defineStore('room', () => {
    let controller = null

    const roomMap = ref(new Map())

    const isFetching = ref(false)
    const isMutating = ref(false)
    const error = ref(null)
    const validationErrors = ref({})
    const totalCount = ref(0)
    const cache = new Map()

    const rooms = computed(() => Array.from(roomMap.value.values()))
    const totalRooms = computed(() => roomMap.value.size)

    function clearCache() {
        cache.clear()
    }

    function getRoomById(id) {
        const numericId = Number(id)
        if (isNaN(numericId)) return undefined
        return roomMap.value.get(numericId)
    }

    async function fetchRooms(page, params = {}) {
        const effectivePage = parseInt(page || params.page, 10) || 1
        const limit = parseInt(params.limit, 10) || 10
        const facilitiesKey = Array.isArray(params.facilities)
            ? [...params.facilities].sort().join(',')
            : (params.facilities || '')

        const cacheKey = `page-${effectivePage}-limit-${limit}-search-${params.search || ''}-status-${params.status || ''}-type-${params.room_type || ''}-floor-${params.floor || ''}-min-${params.min_price || ''}-max-${params.max_price || ''}-fac-${facilitiesKey}`

        if (cache.has(cacheKey)) {
            const cached = cache.get(cacheKey)
            const newMap = new Map()

            cached.list.forEach((room) => {
                if (room && room.id) {
                    newMap.set(room.id, room)
                }
            })

            roomMap.value = newMap
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
                room_type: params.room_type || undefined,
                floor: params.floor || undefined,
                min_price: params.min_price || undefined,
                max_price: params.max_price || undefined,
                facilities: params.facilities || undefined,
            }

            const cleanParams = Object.fromEntries(
                Object.entries(rawParams).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
            )

            const response = await apiClient.get('/admin/rooms', {
                params: cleanParams,
                signal: currentController.signal,
            })

            const responseData = response.data
            const rawList = Array.isArray(responseData.data)
                ? responseData.data
                : (Array.isArray(responseData) ? responseData : []);

            const newMap = new Map()
            rawList.forEach((room) => {
                if (room && room.id) {
                    newMap.set(room.id, room)
                }
            })

            roomMap.value = newMap

            const metaTotal = responseData.meta?.total ?? response.headers['x-total-count']
            totalCount.value = metaTotal !== undefined ? parseInt(metaTotal, 10) : rawList.length

            if (cache.size >= 50) {
                const firstKey = cache.keys().next().value
                cache.delete(firstKey)
            }

            if (rawList.length > 0) {
                cache.set(cacheKey, {
                    list: rawList,
                    total: totalCount.value,
                })
            }
        } catch (err) {
            if (apiClient.isCancel?.(err) || err.name === 'CanceledError') {
                return
            }

            error.value = err.response?.data?.message || 'Failed to fetch rooms'
        } finally {
            if (controller === currentController) {
                isFetching.value = false
            }
        }
    }

    async function fetchRoomById(id) {
        const numericId = Number(id)
        if (isNaN(numericId) || numericId <= 0) {
            error.value = 'Invalid room ID'
            return null
        }

        if (roomMap.value.has(numericId)) {
            return roomMap.value.get(numericId)
        }

        isFetching.value = true
        error.value = null

        try {
            const response = await apiClient.get(`/admin/rooms/${numericId}`)
            const responseData = response.data
            const roomData = Array.isArray(responseData.data)
                ? responseData.data[0]
                : (responseData.data || responseData)

            if (roomData && roomData.id) {
                roomMap.value = immutableSet(roomMap.value, roomData.id, roomData)
            }
            return roomData
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to fetch room details'
            return null
        } finally {
            isFetching.value = false
        }
    }

    function extractValidationErrors(err) {
        const data = err.response?.data
        if (!data) return {}
        if (data.errors && typeof data.errors === 'object') return data.errors
        if (data.fields && typeof data.fields === 'object') return data.fields
        return {}
    }

    async function createRoom(roomData) {
        if (isMutating.value) return false
        isMutating.value = true
        error.value = null
        validationErrors.value = {}

        try {
            await apiClient.post('/admin/create', roomData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            clearCache()
            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to add room'
            validationErrors.value = extractValidationErrors(err)
            return false
        } finally {
            isMutating.value = false
        }
    }

    async function updateRoom(id, updatedData) {
        const numericId = Number(id)
        if (isNaN(numericId) || numericId <= 0) {
            error.value = 'Invalid room ID'
            return false
        }

        if (isMutating.value) return false
        isMutating.value = true
        error.value = null
        validationErrors.value = {}

        try {
            await apiClient.post(`/admin/update/${numericId}`, updatedData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            clearCache()
            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to update room'
            validationErrors.value = extractValidationErrors(err)
            return false
        } finally {
            isMutating.value = false
        }
    }

    async function deleteRoom(payloadIds) {
        const idArray = Array.isArray(payloadIds) ? payloadIds : [payloadIds];

        const validNumericIds = idArray.reduce((acc, item) => {
            if (typeof item === 'number' || typeof item === 'string') {
                const num = Number(item);

                if (Number.isInteger(num) && num > 0) {
                    acc.push(num);
                }
            }
            return acc;
        }, []);

        if (validNumericIds.length === 0) {
            const idText = idArray.length > 1 ? 'IDs' : 'ID';
            error.value = `Invalid room ${idText} provided`;
            return false;
        }

        if (isMutating.value) return false
        isMutating.value = true
        error.value = null

        const deletedRoomsBackup = validNumericIds.reduce((acc, id) => {
            if (roomMap.value.has(id)) {
                acc.push(structuredClone(toRaw(roomMap.value.get(id))));
            }
            return acc;
        }, []);

        const nextMap = new Map(roomMap.value);
        validNumericIds.forEach(id => nextMap.delete(id));
        roomMap.value = nextMap;

        try {
            await apiClient.delete('/admin/delete', {
                data: {
                    id: validNumericIds
                }
            });

            totalCount.value = Math.max(0, totalCount.value - validNumericIds.length);
            clearCache()
            return true
        } catch (err) {
            const restoredMap = new Map(roomMap.value);
            deletedRoomsBackup.forEach(room => restoredMap.set(room.id, room));
            roomMap.value = restoredMap;

            const roomText = validNumericIds.length > 1 ? 'rooms' : 'room';
            error.value = err.response?.data?.message || `Failed to delete ${roomText}. Server error.`
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
        roomMap,
        rooms,
        isFetching,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalRooms,
        getRoomById,
        fetchRooms,
        fetchRoomById,
        createRoom,
        updateRoom,
        deleteRoom,
        clearError,
        clearValidationErrors,
        clearCache,
    }
})