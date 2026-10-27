import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { watchDebounced } from '@vueuse/core'
import { sanitizeText } from '@/utils/sanitizers'

export function useBookingFilter(onParamsChange) {
    const route = useRoute()
    const router = useRouter()

    const search = ref(route.query.search || '')
    const status = ref(route.query.status || '')

    let isInternalUpdate = false

    function buildFilterPayload() {
        return {
            search: search.value.trim() ? sanitizeText(search.value) : undefined,
            status: status.value || undefined
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
            route.query.status
        ],
        ([qSearch, qStatus]) => {
            if (isInternalUpdate) return

            search.value = qSearch || ''
            status.value = qStatus || ''

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

    watch([status], () => {
        syncFilterChanges()
    }, { deep: true })

    function handleFilterChange() {
        syncFilterChanges()
    }

    function resetFilters() {
        search.value = ''
        status.value = ''
        syncFilterChanges()
    }

    return {
        search,
        status,
        handleSearch: (val) => { search.value = val },
        handleFilterChange,
        resetFilters,
        getCleanParams
    }
}