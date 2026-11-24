<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTenantComplaint } from '@/composables/useTenantComplaint';
import { usePagination } from '@/composables/usePagination';

import TenantComplaintCard from '@/components/complaints/TenantComplaintCard.vue';
import AppPagination from '@/components/common/AppPagination.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();

const { formattedIssues, isFetching, isFetchingDetail, error, totalCount, filterTabs, getIssueDetailById, fetchIssues, fetchIssueDetails, clearError } = useTenantComplaint();

const validFilterValues = new Set(filterTabs.map(tab => tab.value));

function parseFilterQuery(queryVal) {
    const normalized = String(queryVal || '')
        .toLowerCase()
        .trim();
    return validFilterValues.has(normalized) ? normalized : 'all';
}

const activeFilter = ref(parseFilterQuery(route.query.filter));
const tabButtonRefs = ref([]);
let latestRequestId = 0;
let scrollTimeoutId = null;

const isDetailDrawerOpen = ref(false);
const selectedIssueId = ref(null);

const selectedIssueDetail = computed(() => {
    if (!selectedIssueId.value) return null;
    return getIssueDetailById(selectedIssueId.value);
});

function scrollToTop() {
    const scrollContainer = document.querySelector('main') || document.querySelector('.overflow-y-auto') || document.documentElement;

    if (scrollContainer && typeof scrollContainer.scrollTo === 'function') {
        scrollContainer.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }
}

const { currentPage, perPage, setPage, resetPage } = usePagination(9, newPage => {
    loadIssues(newPage);
    if (scrollTimeoutId) clearTimeout(scrollTimeoutId);
    scrollTimeoutId = setTimeout(() => {
        scrollToTop();
    }, 50);
});

const safeTotalCount = computed(() => {
    const count = Number(totalCount.value);
    return Number.isFinite(count) && count > 0 ? count : 0;
});

const totalPages = computed(() => {
    const limit = Number(perPage.value) > 0 ? Number(perPage.value) : 9;
    return Math.max(1, Math.ceil(safeTotalCount.value / limit));
});

const isFiltered = computed(() => activeFilter.value !== 'all');

async function loadIssues(page = currentPage.value) {
    const requestId = ++latestRequestId;
    clearError();

    await fetchIssues(page, {
        limit: perPage.value,
        filter: activeFilter.value,
    });

    if (requestId !== latestRequestId) return;

    if (!error.value && safeTotalCount.value > 0 && page > totalPages.value) {
        setPage(totalPages.value, safeTotalCount.value);
    }
}

function handleFilterSelect(filterValue) {
    if (activeFilter.value === filterValue) return;
    activeFilter.value = filterValue;
    resetPage();

    const nextQuery = { ...route.query };
    delete nextQuery.page;

    if (filterValue !== 'all') {
        nextQuery.filter = filterValue;
    } else {
        delete nextQuery.filter;
    }

    router.replace({ query: nextQuery }).catch(() => {});
    loadIssues(1);
}

function handleTabKeydown(event, currentIndex) {
    const lastIndex = filterTabs.length - 1;
    let nextIndex = null;

    if (event.key === 'ArrowRight') {
        nextIndex = currentIndex === lastIndex ? 0 : currentIndex + 1;
    } else if (event.key === 'ArrowLeft') {
        nextIndex = currentIndex === 0 ? lastIndex : currentIndex - 1;
    } else if (event.key === 'Home') {
        nextIndex = 0;
    } else if (event.key === 'End') {
        nextIndex = lastIndex;
    }

    if (nextIndex !== null) {
        event.preventDefault();
        const nextTab = filterTabs[nextIndex];
        if (nextTab) {
            handleFilterSelect(nextTab.value);
            tabButtonRefs.value[nextIndex]?.focus();
        }
    }
}

function handleCreateReport() {
    router.push({ name: 'tenant-complaint-create' });
}

async function handleViewDetail(issueId) {
    if (!issueId) return;
    clearError();
    selectedIssueId.value = issueId;
    isDetailDrawerOpen.value = true;
    await fetchIssueDetails(issueId);
}

function handleCloseDetailDrawer() {
    isDetailDrawerOpen.value = false;
    selectedIssueId.value = null;
    clearError();
}

async function handleRetryDetail() {
    if (!selectedIssueId.value) return;
    clearError();
    await fetchIssueDetails(selectedIssueId.value);
}

watch(
    () => route.query.filter,
    newFilterVal => {
        const parsed = parseFilterQuery(newFilterVal);
        if (activeFilter.value !== parsed) {
            activeFilter.value = parsed;
            resetPage();
            loadIssues(1);
        }
    }
);

onMounted(() => {
    loadIssues(currentPage.value);
});

onUnmounted(() => {
    latestRequestId++;
    if (scrollTimeoutId) {
        clearTimeout(scrollTimeoutId);
    }
});
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen" :aria-busy="isFetching">
        <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-16">
            <h1 class="text-h2 text-text-primary tracking-tight">My Reports</h1>

            <BaseButton variant="primary" size="md" @click="handleCreateReport">
                <span>Report an Issue</span>
                <template #icon-right>
                    <svg class="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M10 4.16699V15.8337" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M4.16699 10H15.8337" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </template>
            </BaseButton>
        </header>

        <div role="tablist" aria-label="Filter complaint status" class="flex flex-wrap items-center gap-2 mb-6">
            <button
                v-for="(tab, index) in filterTabs"
                :key="tab.value"
                ref="tabButtonRefs"
                type="button"
                role="tab"
                :aria-selected="activeFilter === tab.value"
                :tabindex="activeFilter === tab.value ? 0 : -1"
                @click="handleFilterSelect(tab.value)"
                @keydown="handleTabKeydown($event, index)"
                class="px-6 py-3 rounded-xl text-label-btn-md border transition-colors cursor-pointer focus-visible:outline-none"
                :class="activeFilter === tab.value ? 'bg-action-primary text-text-inverse border-border-focus' : 'bg-bg-default text-text-primary border-border-default hover:bg-neutral-100'"
            >
                {{ tab.label }}
            </button>
        </div>

        <div
            v-if="error && !isDetailDrawerOpen"
            role="alert"
            class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between gap-4 animate-fade-in"
        >
            <span class="text-body-md">{{ error }}</span>
            <button type="button" @click="loadIssues()" class="text-label-btn-md cursor-pointer shrink-0 focus-visible:outline-none">Retry</button>
        </div>

        <div v-if="isFetching && formattedIssues.length === 0" class="flex flex-col gap-6 mb-8 animate-pulse" aria-busy="true" aria-label="Loading reports">
            <div v-for="i in 3" :key="'complaint-skeleton-' + i" class="w-full bg-neutral-100 rounded-default p-4.5 flex flex-col gap-6">
                <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-5">
                    <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 flex-1 min-w-0">
                        <div class="w-full sm:w-56 md:w-60 aspect-16/10 bg-neutral-200 rounded-default shrink-0"></div>

                        <div class="flex flex-col gap-3 flex-1 min-w-0">
                            <div class="flex items-start justify-between gap-3 sm:block">
                                <div class="h-6 my-0.75 w-56 max-w-full bg-neutral-200 rounded-md"></div>
                                <div class="sm:hidden h-8 w-20 bg-neutral-200 rounded-xl shrink-0"></div>
                            </div>

                            <div class="flex flex-col">
                                <div class="h-5 my-0.5 w-full max-w-xl bg-neutral-200 rounded-md"></div>
                                <div class="h-5 my-0.5 w-3/4 max-w-md bg-neutral-200 rounded-md"></div>
                            </div>

                            <div class="flex items-center gap-1.5">
                                <div class="w-4 h-4 bg-neutral-200 rounded-full shrink-0"></div>
                                <div class="h-5 my-0.5 w-32 bg-neutral-200 rounded-md"></div>
                            </div>
                        </div>
                    </div>

                    <div class="hidden sm:block h-8 w-20 bg-neutral-200 rounded-xl shrink-0"></div>
                </div>

                <div class="pt-6 border-t border-border-default flex flex-wrap items-center justify-between gap-4">
                    <div class="h-6 w-48 bg-neutral-200 rounded-md"></div>
                    <div class="h-10.5 w-25 bg-neutral-200 rounded-xl"></div>
                </div>
            </div>
        </div>

        <template v-else-if="formattedIssues.length > 0">
            <section aria-label="Submitted reports list" class="flex flex-col gap-6 mb-8 transition-opacity duration-150" :class="isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'">
                <TenantComplaintCard v-for="item in formattedIssues" :key="item.id" :complaint="item" @view-detail="handleViewDetail" />
            </section>

            <div v-if="safeTotalCount > 0 && totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p class="text-body-sm text-text-secondary pl-2">
                    Showing page <span class="font-semibold text-text-primary">{{ currentPage }}</span> of
                    <span class="font-semibold text-text-primary">{{ totalPages }}</span>
                    (<span class="font-semibold text-text-primary">{{ safeTotalCount }}</span> total reports)
                </p>
                <AppPagination v-model="currentPage" :total-pages="totalPages" />
            </div>
        </template>

        <section v-else aria-label="Empty reports state" class="flex-1 py-16 sm:py-20 px-6 sm:px-10 flex flex-col items-center justify-center text-center gap-6">
            <svg class="w-28 h-28 shrink-0 text-text-secondary" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                    d="M39.6 89.9997V71.5497L48.15 72.4497C50.6391 72.3114 52.9947 71.2794 54.7837 69.5432C56.5728 67.8071 57.6751 65.4836 57.888 62.9997V37.3497C57.9178 30.8668 55.3711 24.6375 50.8081 20.0323C46.245 15.427 40.0395 12.8231 33.5565 12.7932C27.0735 12.7634 20.8443 15.3101 16.239 19.8732C11.6338 24.4362 9.02984 30.6418 9 37.1247C9 49.7247 11.952 50.8677 13.5 57.5997C14.5408 61.6661 14.5856 65.9234 13.6305 70.0107L9 89.9997M89.1 80.0997C95.4262 73.7728 98.9813 65.1929 98.9838 56.2458C98.9863 47.2987 95.4361 38.7167 89.1135 32.3862M76.5 67.4997C77.9723 66.0277 79.1381 64.2785 79.9301 62.3531C80.7221 60.4277 81.1245 58.3644 81.114 56.2825C81.1035 54.2006 80.6804 52.1415 79.8692 50.2241C79.0579 48.3068 77.8745 46.5693 76.3875 45.1122"
                    stroke-width="6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke="currentColor"
                />
            </svg>

            <div class="flex flex-col items-center gap-8 sm:gap-10 max-w-2xl">
                <p class="text-h3 text-text-secondary">
                    {{
                        isFiltered
                            ? 'There are no reports under this status filter. Try switching to another status.'
                            : 'Your submitted reports will appear here. Let us know if you experience any issues.'
                    }}
                </p>

                <BaseButton v-if="isFiltered" variant="secondary" size="md" @click="handleFilterSelect('all')"> Show All Reports </BaseButton>

                <BaseButton v-else variant="primary" size="md" @click="handleCreateReport">
                    <span>Report an Issue</span>
                    <template #icon-right>
                        <svg class="w-4 h-4 shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path d="M10 4.16699V15.8337" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
                            <path d="M4.16699 10H15.8337" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </template>
                </BaseButton>
            </div>
        </section>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-out both;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
