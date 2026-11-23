import { defineStore } from "pinia";
import { ref, computed, toRaw } from "vue";
import apiClient from "@/services/api";
import { immutableSet } from "@/utils/mapUtils";

export const useRoomStore = defineStore('room', () => {
    let controller = null

    const roomMap = ref(new Map())
    const isFetching = ref(false)
    const isMutating = ref(false)
    const isMutatingFacility = ref(false)
    const isExporting = ref(false)
    const error = ref(null)
    const validationErrors = ref({})
    const totalCount = ref(0)
    const cache = new Map()

    const rooms = computed(() => Array.from(roomMap.value.values()))
    const totalRooms = computed(() => roomMap.value.size)

    function getValidNumericId(id) {
        if (typeof id === 'number' || typeof id === 'string') {
            const num = Number(id)
            if (Number.isInteger(num) && num > 0) {
                return num
            }
        }
        return null
    }

    function extractValidationErrorsFromObject(data) {
        if (!data || typeof data !== 'object') return {}
        if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) return data.errors
        if (data.error && typeof data.error === 'object' && !Array.isArray(data.error)) return data.error
        if (data.fields && typeof data.fields === 'object' && !Array.isArray(data.fields)) return data.fields
        return {}
    }

    async function parseBlobJsonError(blob, fallbackMessage = 'Failed to export room records.') {
        try {
            const rawText = await blob.text()
            const parsed = JSON.parse(rawText)
            return {
                message: parsed?.message || fallbackMessage,
                fields: extractValidationErrorsFromObject(parsed),
            }
        } catch {
            return {
                message: fallbackMessage,
                fields: {},
            }
        }
    }

    async function parseExportError(err) {
        const responseData = err.response?.data
        if (responseData instanceof Blob) {
            return parseBlobJsonError(responseData)
        }

        return {
            message: responseData?.message || 'Failed to export room records.',
            fields: extractValidationErrors(err),
        }
    }

    function extractFilenameFromHeader(dispositionHeader, fallback = 'rooms.csv') {
        if (!dispositionHeader || typeof dispositionHeader !== 'string') return fallback
        const utfMatch = dispositionHeader.match(/filename\*=UTF-8''([^;]+)/i)
        if (utfMatch?.[1]) return decodeURIComponent(utfMatch[1].trim())

        const plainMatch = dispositionHeader.match(/filename="?([^";]+)"?/i)
        if (plainMatch?.[1]) return plainMatch[1].trim()

        return fallback
    }

    function normalizeExportStatus(rawStatus) {
        if (!rawStatus || typeof rawStatus !== 'string') return undefined
        const normalized = rawStatus.trim().toLowerCase()
        if (!normalized || normalized === 'all') return undefined
        return normalized
    }

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
        return extractValidationErrorsFromObject(err.response?.data)
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

    async function addFacility(facilityData) {
        if (isMutatingFacility.value) return false
        isMutatingFacility.value = true
        error.value = null
        validationErrors.value = {}

        try {
            await apiClient.post('/admin/rooms/facilities/add', facilityData)
            clearCache()
            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Failed to add facility'
            validationErrors.value = extractValidationErrors(err)
            return false
        } finally {
            isMutatingFacility.value = false
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

    async function exportRooms(params = {}) {
        if (isExporting.value) return null

        isExporting.value = true
        error.value = null
        validationErrors.value = {}

        try {
            const numericRoomType = getValidNumericId(params.room_type)
            const numericFloor = getValidNumericId(params.floors)
            const rawParams = {
                room_status: normalizeExportStatus(params.room_status),
                room_type: numericRoomType || undefined,
                floors: numericFloor || undefined,
            }

            const cleanParams = Object.fromEntries(
                Object.entries(rawParams).filter(([_, value]) => value !== '' && value !== undefined && value !== null)
            )

            const response = await apiClient.get('/admin/rooms/export', {
                params: cleanParams,
                responseType: 'blob',
            })

            if (response.data instanceof Blob && response.data.type?.includes('application/json')) {
                const parsedError = await parseBlobJsonError(response.data)
                error.value = parsedError.message
                validationErrors.value = parsedError.fields
                return null
            }

            const filename = extractFilenameFromHeader(
                response.headers?.['content-disposition'],
                'rooms.csv'
            )

            return {
                blob: response.data,
                filename,
            }
        } catch (err) {
            const parsedError = await parseExportError(err)
            error.value = parsedError.message
            validationErrors.value = parsedError.fields
            return null
        } finally {
            isExporting.value = false
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
        isMutatingFacility,
        isExporting,
        error,
        validationErrors,
        totalCount,
        totalRooms,
        getRoomById,
        fetchRooms,
        fetchRoomById,
        createRoom,
        updateRoom,
        addFacility,
        deleteRoom,
        exportRooms,
        clearError,
        clearValidationErrors,
        clearCache,
    }
})