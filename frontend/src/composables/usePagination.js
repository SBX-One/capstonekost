import { ref, computed, watch } from "vue";

export function usePagination(totalItems, initialItemsPerPage = 10) {
    const itemsPerPage = initialItemsPerPage > 0 ? initialItemsPerPage : 10;
    const currentPage = ref(1);

    const totalPages = computed(() => Math.ceil((totalItems.value || 0) / itemsPerPage) || 1);

    watch(totalPages, (newVal) => {
        if (currentPage.value > newVal) {
            currentPage.value = Math.max(1, newVal);
        }
    });

    const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage);
    const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalItems.value || 0));

    function goToPage(page) {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    }

    function nextPage() {
        goToPage(currentPage.value + 1);
    }

    function previousPage() {
        goToPage(currentPage.value - 1);
    }

    function resetPage() {
        currentPage.value = 1;
    }

    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        itemsPerPage,
        resetPage,
        goToPage,
        nextPage,
        previousPage
    };
}