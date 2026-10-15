import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export function usePagination(defaultPerPage = 10, onPageChangeCallback) {
    const route = useRoute()
    const router = useRouter()

    const parsePage = (val) => {
        const parsed = parseInt(val, 10)
        return isNaN(parsed) || parsed < 1 ? 1 : parsed
    }

    const page = ref(parsePage(route.query.page))
    const perPage = computed(() => defaultPerPage)
    let isInternalPageUpdate = false

    watch(
        () => route.query.page,
        (newPageVal) => {
            const parsed = parsePage(newPageVal)
            if (page.value !== parsed) {
                page.value = parsed
                if (!isInternalPageUpdate && onPageChangeCallback) {
                    onPageChangeCallback(parsed)
                }
            }
        }
    )

    function setPage(newPage, totalCount = 0) {
        const maxPage = Math.ceil(totalCount / perPage.value) || 1
        const safePage = parsePage(newPage)
        const targetPage = totalCount > 0 && safePage > maxPage ? maxPage : safePage

        const currentUrlPage = parsePage(route.query.page)
        if (page.value === targetPage && currentUrlPage === targetPage) {
            return
        }

        isInternalPageUpdate = true
        page.value = targetPage

        const nextQuery = { ...route.query }
        if (targetPage > 1) {
            nextQuery.page = String(targetPage)
        } else {
            delete nextQuery.page
        }

        router.replace({ query: nextQuery }).catch(() => { }).finally(() => {
            isInternalPageUpdate = false
        })

        if (onPageChangeCallback) {
            onPageChangeCallback(targetPage)
        }
    }

    function resetPage() {
        isInternalPageUpdate = true
        page.value = 1
        Promise.resolve().then(() => {
            isInternalPageUpdate = false
        })
    }

    return {
        currentPage: computed({
            get: () => page.value,
            set: (val) => setPage(val, 0)
        }),
        perPage,
        setPage,
        resetPage
    }
}