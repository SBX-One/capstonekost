import { reactive, watch, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { watchDebounced } from '@vueuse/core';
import { sanitizeText } from '@/utils/sanitizers';

export function useBookingFilter(onParamsChange) {
    const route = useRoute()
    const router = useRouter()

    const state = reactive({
        search: route.query.search || '',
        status: route.query.status || ''
    })

    let isSyncing = false

    const getCleanQuery = () => {
        const payload = {
            search: state.search.trim() ? sanitizeText(state.search) : undefined,
            status: state.status || undefined
        }
        return Object.fromEntries(Object.entries(payload).filter(([_, value]) => value !== undefined && value !== ''))
    }

    watchDebounced(
        () => [state.search, state.status],
        async () => {
            if (isSyncing) return

            const currentUrlQuery = router.currentRoute.value.query
            const newQuery = { ...currentUrlQuery, ...getCleanQuery() }

            Object.keys(state).forEach(key => {
                if (!newQuery[key]) delete newQuery[key]
            })
            delete newQuery.page

            if (JSON.stringify(currentUrlQuery) !== JSON.stringify(newQuery)) {
                isSyncing = true
                await router.replace({ query: newQuery }).catch(() => { })
                isSyncing = false
            }
        },
        { debounce: 400, deep: true }
    )

    watch(
        () => route.query,
        (newQuery) => {
            isSyncing = true

            state.search = newQuery.search || ''
            state.status = newQuery.status || ''

            isSyncing = false

            if (onParamsChange) onParamsChange()
        },
        { deep: true, immediate: false }
    )

    function resetFilters() {
        const query = { ...router.currentRoute.value.query }
        delete query.search
        delete query.status
        delete query.page
        router.replace({ query }).catch(() => { })
    }

    return {
        ...toRefs(state),
        resetFilters,
        getCleanParams: getCleanQuery
    }
}