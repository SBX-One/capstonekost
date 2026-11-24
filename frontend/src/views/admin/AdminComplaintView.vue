<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAdminComplaint } from '@/composables/useAdminComplaint';
import { usePagination } from '@/composables/usePagination';

import AppPagination from '@/components/common/AppPagination.vue';
import AppWhatsAppModal from '@/components/common/AppWhatsAppModal.vue';
import AdminComplaintTable from '@/components/complaints/AdminComplaintTable.vue';
import ComplaintDetailDrawer from '@/components/complaints/ComplaintDetailDrawer.vue';

const route = useRoute();
const router = useRouter();

const { formattedIssues, isFetching, isFetchingDetail, isMutating, error, totalCount, filterTabs, getIssueDetailById, fetchIssues, fetchIssueDetails, clearError } = useAdminComplaint();

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
let latestDetailRequestId = 0;
let scrollTimeoutId = null;

const isDetailDrawerOpen = ref(false);
const selectedIssueId = ref(null);

const isContactModalOpen = ref(false);
const contactTargetIssue = ref(null);

const selectedIssueDetail = computed(() => {
    if (!selectedIssueId.value) return null;
    return getIssueDetailById(selectedIssueId.value);
});

const contactWhatsAppMessage = computed(() => {
    const issue = contactTargetIssue.value;
    if (!issue) return '';
    const tenantName = issue.tenantName && issue.tenantName !== '-' ? issue.tenantName : 'Tenant';
    const issueTitle = issue.title && issue.title !== '-' ? ` "${issue.title}"` : '';
    return `Hello ${tenantName}, we are following up on your issue report${issueTitle}.`;
});

const drawerError = computed(() => (isDetailDrawerOpen.value ? error.value || '' : ''));

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

async function handleViewDetail(issue) {
    const issueId = issue?.id;
    if (!issueId) return;

    const detailRequestId = ++latestDetailRequestId;
    clearError();
    selectedIssueId.value = issueId;
    isDetailDrawerOpen.value = true;

    await fetchIssueDetails([issueId]);
    if (detailRequestId !== latestDetailRequestId) return;
}

function handleCloseDetailDrawer() {
    latestDetailRequestId++;
    isDetailDrawerOpen.value = false;
    selectedIssueId.value = null;
    clearError();
}

async function handleRetryDetail() {
    if (!selectedIssueId.value) return;

    const detailRequestId = ++latestDetailRequestId;
    clearError();

    await fetchIssueDetails([selectedIssueId.value]);
    if (detailRequestId !== latestDetailRequestId) return;
}

function handleOpenContactModal(issue) {
    if (!issue) return;
    contactTargetIssue.value = issue;
    isContactModalOpen.value = true;
}

function handleCloseContactModal() {
    isContactModalOpen.value = false;
    contactTargetIssue.value = null;
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
    latestDetailRequestId++;
    if (scrollTimeoutId) {
        clearTimeout(scrollTimeoutId);
    }
});
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen" :aria-busy="isFetching">
        <header class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-16">
            <div class="flex flex-col gap-1">
                <h1 class="text-h2 text-text-primary tracking-tight">Reported Issues</h1>
                <p class="text-body-lg text-text-secondary">Monitor reported issues and ensure every concern is properly addressed.</p>
            </div>
        </header>

        <section aria-label="Reported issues management">
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

            <div class="mb-8">
                <AdminComplaintTable :issues="formattedIssues" :is-fetching="isFetching" :is-filtered="isFiltered" @view="handleViewDetail" @reset-filter="handleFilterSelect('all')" />
            </div>

            <div v-if="safeTotalCount > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p class="text-body-sm text-text-secondary pl-2">
                    Showing page <span class="font-semibold text-text-primary">{{ currentPage }}</span> of <span class="font-semibold text-text-primary">{{ totalPages }}</span> (<span
                        class="font-semibold text-text-primary"
                        >{{ safeTotalCount }}</span
                    >
                    total issues)
                </p>
                <AppPagination v-model="currentPage" :total-pages="totalPages" />
            </div>
        </section>

        <ComplaintDetailDrawer
            :is-open="isDetailDrawerOpen"
            role="admin"
            :issue="selectedIssueDetail"
            :is-loading="isFetchingDetail"
            :is-submitting="isMutating"
            :error="drawerError"
            @close="handleCloseDetailDrawer"
            @retry="handleRetryDetail"
            @contact-tenant="handleOpenContactModal"
        />

        <AppWhatsAppModal :is-open="isContactModalOpen" :phone="contactTargetIssue?.tenantPhone || ''" :message="contactWhatsAppMessage" @close="handleCloseContactModal" />
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
