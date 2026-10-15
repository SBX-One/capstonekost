import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
import { sanitizeText } from '@/utils/sanitizers'

export function useRoomFilter(onParamsChange) {
    const route = useRoute()
    const router = useRouter()

    const parseFacilities = (val) => (Array.isArray(val) ? val : val ? [val] : [])

    const search = ref(route.query.search || '')
    const roomType = ref(route.query.room_type || '')
    const floor = ref(route.query.floor || '')
    const minPrice = ref(route.query.min_price || '')
    const maxPrice = ref(route.query.max_price || '')
    const status = ref(route.query.status || '')
    const facilities = ref(parseFacilities(route.query.facilities))

    let isInternalUpdate = false

    function buildFilterPayload() {
        return {
            search: search.value.trim() ? sanitizeText(search.value) : undefined,
            room_type: roomType.value || undefined,
            floor: floor.value || undefined,
            min_price: minPrice.value || undefined,
            max_price: maxPrice.value || undefined,
            status: status.value || undefined,
            facilities: facilities.value.length > 0 ? [...facilities.value] : undefined
        }
    }

    function getCleanParams() {
        return Object.fromEntries(
            Object.entries(buildFilterPayload()).filter(([_, value]) => value !== undefined && value !== '' && value !== null)
        )
    }

    let lastAppliedSignature = JSON.stringify(getCleanParams())

    function syncFilterChanges() {
        const currentSignature = JSON.stringify(getCleanParams())
        if (currentSignature === lastAppliedSignature) return

        lastAppliedSignature = currentSignature
        isInternalUpdate = true

        const query = {
            ...route.query,
            page: undefined,
            ...buildFilterPayload()
        }

        Object.keys(query).forEach(key => {
            if (!query[key] || (Array.isArray(query[key]) && query[key].length === 0)) {
                delete query[key]
            }
        })

        router.replace({ query }).catch(() => { }).finally(() => {
            isInternalUpdate = false
        })

        if (onParamsChange) onParamsChange()
    }

    watch(
        () => [
            route.query.search,
            route.query.room_type,
            route.query.floor,
            route.query.min_price,
            route.query.max_price,
            route.query.status,
            route.query.facilities
        ],
        ([qSearch, qRoomType, qFloor, qMinPrice, qMaxPrice, qStatus, qFacilities]) => {
            if (isInternalUpdate) return

            search.value = qSearch || ''
            roomType.value = qRoomType || ''
            floor.value = qFloor || ''
            minPrice.value = qMinPrice || ''
            maxPrice.value = qMaxPrice || ''
            status.value = qStatus || ''
            facilities.value = parseFacilities(qFacilities)

            const newSignature = JSON.stringify(getCleanParams())
            if (newSignature !== lastAppliedSignature) {
                lastAppliedSignature = newSignature
                if (onParamsChange) onParamsChange()
            }
        }
    )

    watchDebounced(search, () => {
        syncFilterChanges()
    }, { debounce: 400 })

    watch([roomType, floor, minPrice, maxPrice, status, facilities], () => {
        syncFilterChanges()
    }, { deep: true })

    function handleFilterChange() {
        syncFilterChanges()
    }

    function resetFilters() {
        search.value = ''
        roomType.value = ''
        floor.value = ''
        minPrice.value = ''
        maxPrice.value = ''
        status.value = ''
        facilities.value = []

        syncFilterChanges()
    }

    return {
        search,
        roomType,
        floor,
        minPrice,
        maxPrice,
        status,
        facilities,
        handleSearch: (val) => { search.value = val },
        handleFilterChange,
        resetFilters,
        getCleanParams
    }
}