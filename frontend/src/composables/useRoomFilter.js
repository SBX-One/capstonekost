import { useRouteQuery } from '@vueuse/router'
import { watchDebounced } from '@vueuse/core'
import { sanitizeText } from '@/utils/sanitizers'

export function useRoomFilter(onParamsChange) {
    const search = useRouteQuery('search', '', {
        transform: (rawSearch) => sanitizeText(rawSearch || '')
    })
    const roomType = useRouteQuery('room_type', '')
    const floor = useRouteQuery('floor', '')
    const minPrice = useRouteQuery('min_price', '')
    const maxPrice = useRouteQuery('max_price', '')
    const status = useRouteQuery('status', '')
    const facilities = useRouteQuery('facilities', [], {
        transform: (queryValue) => (Array.isArray(queryValue) ? queryValue : queryValue ? [queryValue] : [])
    })

    watchDebounced(
        search,
        () => {
            if (onParamsChange) {
                onParamsChange()
            }
        },
        { debounce: 400, maxWait: 1000 }
    )

    function handleFilterChange() {
        if (onParamsChange) {
            onParamsChange()
        }
    }

    function resetFilters() {
        search.value = ''
        roomType.value = ''
        floor.value = ''
        minPrice.value = ''
        maxPrice.value = ''
        status.value = ''
        facilities.value = []

        if (onParamsChange) {
            onParamsChange()
        }
    }

    function getCleanParams() {
        const rawParams = {
            search: search.value || undefined,
            room_type: roomType.value || undefined,
            floor: floor.value || undefined,
            min_price: minPrice.value || undefined,
            max_price: maxPrice.value || undefined,
            status: status.value || undefined,
            facilities: facilities.value.length > 0 ? facilities.value : undefined
        }

        return Object.fromEntries(
            Object.entries(rawParams).filter(([_, value]) => value !== undefined && value !== '' && value !== null)
        )
    }

    return {
        search,
        roomType,
        floor,
        minPrice,
        maxPrice,
        status,
        facilities,
        handleSearch: (val) => { search.value = sanitizeText(val) },
        handleFilterChange,
        resetFilters,
        getCleanParams
    }
}