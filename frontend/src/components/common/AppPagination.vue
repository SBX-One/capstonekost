<script setup>
import { computed } from 'vue';

const props = defineProps({
    totalPages: {
        type: Number,
        required: true,
        default: 1,
    },
});

const currentPage = defineModel({
    type: Number,
    required: true,
    default: 1,
});

const displayedPages = computed(() => {
    const total = Number(props.totalPages) || 1;
    const current = Number(currentPage.value) || 1;

    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages = new Set([1, total, current, current - 1, current + 1]);

    const sortedPages = Array.from(pages)
        .filter(p => p >= 1 && p <= total)
        .sort((a, b) => a - b);

    const result = [];
    let prev = null;

    for (const page of sortedPages) {
        if (prev !== null) {
            if (page - prev === 2) {
                result.push(prev + 1);
            } else if (page - prev > 2) {
                result.push('...');
            }
        }
        result.push(page);
        prev = page;
    }

    return result;
});

const changePage = page => {
    const total = Number(props.totalPages) || 1;
    if (typeof page === 'number' && page >= 1 && page <= total && page !== currentPage.value) {
        currentPage.value = page;
    }
};
</script>

<template>
    <nav v-if="totalPages > 1" class="flex items-center justify-center gap-4 py-3 px-4 select-none" aria-label="Pagination">
        <button
            type="button"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
            :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150',
                currentPage === 1 ? 'text-text-disabled cursor-not-allowed bg-transparent' : 'text-text-primary hover:bg-neutral-300 active:bg-neutral-900 active:text-white cursor-pointer',
            ]"
            aria-label="Previous Page"
        >
            <svg class="w-4 h-4" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.25 0.75L0.75 5.25L5.25 9.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>

        <template v-for="(page, index) in displayedPages" :key="index">
            <span v-if="page === '...'" class="w-10 h-10 flex items-center justify-center text-text-secondary text-body-md select-none"> ... </span>

            <button
                v-else
                type="button"
                @click="changePage(page)"
                :aria-current="page === currentPage ? 'page' : undefined"
                :class="[
                    'w-10 h-10 rounded-xl text-body-md flex items-center justify-center transition-all duration-150 cursor-pointer',
                    page === currentPage ? 'bg-neutral-900 text-neutral-50' : 'text-text-primary hover:bg-neutral-300 active:bg-neutral-200',
                ]"
            >
                {{ page }}
            </button>
        </template>

        <button
            type="button"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
            :class="[
                'w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150',
                currentPage === totalPages ? 'text-text-disabled cursor-not-allowed bg-transparent' : 'text-text-primary hover:bg-neutral-300 active:bg-neutral-900 active:text-white cursor-pointer',
            ]"
            aria-label="Next Page"
        >
            <svg class="w-4 h-4" viewBox="0 0 6 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.75 0.75L5.25 5.25L0.75 9.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    </nav>
</template>
