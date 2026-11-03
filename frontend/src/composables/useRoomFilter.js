import { reactive, watch, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { sanitizeText } from '@/utils/sanitizers';

export function useRoomFilter(onParamsChange) {
    const route = useRoute()
    const router = useRouter()

    const parseFacilities = (val) => (Array.isArray(val) ? val : val ? [val] : [])

    const state = reactive({
        search: route.query.search || '',
        roomType: route.query.room_type || '',
        floor: route.query.floor || '',
        minPrice: route.query.min_price || '',
        maxPrice: route.query.max_price || '',
        status: route.query.status || '',
        facilities: parseFacilities(route.query.facilities)
    })

    let isSyncing = false

    const getCleanQuery = () => {
        const payload = {
            search: state.search.trim() ? sanitizeText(state.search) : undefined,
            room_type: state.roomType || undefined,
            floor: state.floor || undefined,
            min_price: state.minPrice || undefined,
            max_price: state.maxPrice || undefined,
            status: state.status || undefined,
            facilities: state.facilities.length > 0 ? [...state.facilities] : undefined
        }
        return Object.fromEntries(Object.entries(payload).filter(([_, value]) => value !== undefined && value !== ''))
    }

    watch(
        () => [state.roomType, state.floor, state.minPrice, state.maxPrice, state.status, state.facilities],
        async () => {
            if (isSyncing) return

            const currentUrlQuery = router.currentRoute.value.query
            const newQuery = { ...currentUrlQuery, ...getCleanQuery() }

            Object.keys(state).forEach(key => {
                const urlKey = key === 'roomType' ? 'room_type' : key === 'minPrice' ? 'min_price' : key === 'maxPrice' ? 'max_price' : key
                if (!newQuery[urlKey] || (Array.isArray(newQuery[urlKey]) && newQuery[urlKey].length === 0)) {
                    delete newQuery[urlKey]
                }
            })
            delete newQuery.page

            if (JSON.stringify(currentUrlQuery) !== JSON.stringify(newQuery)) {
                isSyncing = true
                await router.replace({ query: newQuery }).catch(() => { })
                isSyncing = false
            }
        },
        { deep: true }
    )

    watch(
        () => route.query,
        (newQuery) => {
            isSyncing = true

            state.search = newQuery.search || ''
            state.roomType = newQuery.room_type || ''
            state.floor = newQuery.floor || ''
            state.minPrice = newQuery.min_price || ''
            state.maxPrice = newQuery.max_price || ''
            state.status = newQuery.status || ''
            const newFac = parseFacilities(newQuery.facilities)
            if (JSON.stringify(state.facilities) !== JSON.stringify(newFac)) {
                state.facilities = newFac
            }

            isSyncing = false

            if (onParamsChange) onParamsChange()
        },
        { deep: true, immediate: false }
    )

    function resetFilters() {
        const query = { ...router.currentRoute.value.query }
        delete query.search
        delete query.room_type
        delete query.floor
        delete query.min_price
        delete query.max_price
        delete query.status
        delete query.facilities
        delete query.page
        router.replace({ query }).catch(() => { })
    }

    return {
        ...toRefs(state),
        handleFilterChange: () => { },
        resetFilters,
        getCleanParams: getCleanQuery
    }
}