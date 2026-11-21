<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTenantPayment } from '@/composables/useTenantPayment';
import { usePagination } from '@/composables/usePagination';

import PaymentOverviewCard from '@/components/payment/PaymentOverviewCard.vue';
import PaymentDetailModal from '@/components/payment/PaymentDetailModal.vue';
import AppPagination from '@/components/common/AppPagination.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const route = useRoute();
const router = useRouter();

const { formattedPayments, isFetching, isFetchingDetail, error, totalCount, filterTabs, getPaymentDetailById, fetchPayments, fetchPaymentDetails, clearError } = useTenantPayment();

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

const isDetailModalOpen = ref(false);
const selectedPaymentId = ref(null);

const selectedPaymentDetail = computed(() => {
    if (!selectedPaymentId.value) return null;
    return getPaymentDetailById(selectedPaymentId.value);
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
    loadPayments(newPage);
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

const bookingCountLabel = computed(() => {
    const total = safeTotalCount.value;
    return `${total} ${total === 1 ? 'Booking' : 'Bookings'}`;
});

const isFiltered = computed(() => activeFilter.value !== 'all');

async function loadPayments(page = currentPage.value) {
    const requestId = ++latestRequestId;
    clearError();

    await fetchPayments(page, {
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
    loadPayments(1);
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

async function handleViewDetail(paymentId) {
    if (!paymentId) return;
    clearError();
    selectedPaymentId.value = paymentId;
    isDetailModalOpen.value = true;
    await fetchPaymentDetails(paymentId);
}

function handleCloseDetailModal() {
    isDetailModalOpen.value = false;
    clearError();
}

async function handleRetryDetail() {
    if (!selectedPaymentId.value) return;
    clearError();
    await fetchPaymentDetails(selectedPaymentId.value);
}

watch(
    () => route.query.filter,
    newFilterVal => {
        const parsed = parseFilterQuery(newFilterVal);
        if (activeFilter.value !== parsed) {
            activeFilter.value = parsed;
            resetPage();
            loadPayments(1);
        }
    }
);

onMounted(() => {
    loadPayments(currentPage.value);
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
        <header class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-16">
            <div class="flex flex-col gap-1">
                <h1 class="text-h2 text-text-primary tracking-tight">Payment Overview</h1>
                <p class="text-body-lg text-text-secondary">Your bookings and their individual payment summaries.</p>
            </div>

            <span class="text-body-lg text-text-secondary shrink-0 sm:pt-1" aria-live="polite">
                {{ bookingCountLabel }}
            </span>
        </header>

        <div role="tablist" aria-label="Filter payment status" class="flex flex-wrap items-center gap-2 mb-6">
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
            v-if="error && !isDetailModalOpen"
            role="alert"
            class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between gap-4 animate-fade-in"
        >
            <span class="text-body-md">{{ error }}</span>
            <button type="button" @click="loadPayments()" class="text-label-btn-md cursor-pointer shrink-0 focus-visible:outline-none">Retry</button>
        </div>

        <div v-if="isFetching && formattedPayments.length === 0" class="flex flex-col gap-6 mb-8 animate-pulse" aria-busy="true" aria-label="Loading payment overview">
            <div v-for="i in 3" :key="'payment-skeleton-' + i" class="w-full bg-neutral-100 rounded-default p-6 flex flex-col gap-4">
                <div class="flex items-start justify-between gap-4">
                    <div class="h-8 w-44 bg-neutral-200 rounded-md"></div>
                    <div class="h-6 w-20 bg-neutral-200 rounded-full shrink-0"></div>
                </div>

                <hr class="border-t border-border-default m-0" />

                <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-12">
                    <div class="flex flex-col gap-1 min-w-0">
                        <div class="h-5 w-36 bg-neutral-200 rounded-md"></div>
                        <div class="h-10 w-52 bg-neutral-200 rounded-md"></div>
                    </div>

                    <div class="flex flex-col gap-1 min-w-0">
                        <div class="h-5 w-28 bg-neutral-200 rounded-md"></div>
                        <div class="h-8 w-36 bg-neutral-200 rounded-md"></div>
                    </div>
                </div>

                <hr class="border-t border-border-default m-0" />

                <div class="flex flex-col gap-4">
                    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <div class="h-5 w-28 bg-neutral-200 rounded-md"></div>
                        <div class="h-7 w-44 bg-neutral-200 rounded-md"></div>
                    </div>

                    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <div class="h-5 w-28 bg-neutral-200 rounded-md"></div>
                        <div class="h-7 w-28 bg-neutral-200 rounded-md"></div>
                    </div>

                    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <div class="h-5 w-24 bg-neutral-200 rounded-md"></div>
                        <div class="h-7 w-24 bg-neutral-200 rounded-md"></div>
                    </div>
                </div>

                <hr class="border-t border-border-default m-0" />

                <div class="flex flex-col gap-4">
                    <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <div class="h-5 w-36 bg-neutral-200 rounded-md"></div>
                        <div class="h-8 w-32 bg-neutral-200 rounded-md"></div>
                    </div>

                    <div class="h-9 w-24 bg-neutral-200 rounded-xl"></div>
                </div>
            </div>
        </div>

        <template v-else-if="formattedPayments.length > 0">
            <section aria-label="Payment records list" class="flex flex-col gap-6 mb-8 transition-opacity duration-150" :class="isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'">
                <PaymentOverviewCard v-for="item in formattedPayments" :key="item.id" :payment="item" @view-detail="handleViewDetail" />
            </section>

            <div v-if="safeTotalCount > 0 && totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p class="text-body-sm text-text-secondary pl-2">
                    Showing page <span class="font-semibold text-text-primary">{{ currentPage }}</span> of
                    <span class="font-semibold text-text-primary">{{ totalPages }}</span>
                    (<span class="font-semibold text-text-primary">{{ safeTotalCount }}</span> total bookings)
                </p>
                <AppPagination v-model="currentPage" :total-pages="totalPages" />
            </div>
        </template>

        <section v-else aria-label="Empty payment history" class="flex-1 py-20 px-6 flex flex-col items-center justify-center text-center gap-4">
            <svg class="w-28 h-28 shrink-0 text-text-secondary" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                    d="M27 40.5H40.5M40.5 40.5L22.5 22.5M40.5 40.5L85.5 85.5M13.5 13.5L22.5 22.5M22.5 22.5H18C15.6131 22.5 13.3239 23.4482 11.636 25.136C9.94821 26.8239 9 29.1131 9 31.5V76.5C9 78.8869 9.94821 81.1761 11.636 82.864C13.3239 84.5518 15.6131 85.5 18 85.5H85.5M85.5 85.5L94.5 94.5M85.5 85.5H90C92.3869 85.5 94.6761 84.5518 96.364 82.864C98.0518 81.1761 99 78.8869 99 76.5V40.5M99 40.5V31.5C99 29.1131 98.0518 26.8239 96.364 25.136C94.6761 23.4482 92.3869 22.5 90 22.5H45M99 40.5H63"
                    stroke-width="6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke="currentColor"
                />
            </svg>

            <div class="flex flex-col items-center gap-2 max-w-2xl">
                <h2 class="text-h3 text-text-primary tracking-tight">
                    {{ isFiltered ? 'No Matching Payment Records' : 'No Payment History Yet' }}
                </h2>
                <p class="text-h4 text-text-secondary">
                    {{
                        isFiltered
                            ? 'There are no payment records under this status filter. Try switching to another status.'
                            : 'Your recorded transactions will appear here once the admin has recorded your payment'
                    }}
                </p>
            </div>

            <BaseButton v-if="isFiltered" variant="secondary" size="md" class="mt-2" @click="handleFilterSelect('all')"> Show All Payments </BaseButton>
        </section>

        <PaymentDetailModal :is-open="isDetailModalOpen" :payment="selectedPaymentDetail" :is-loading="isFetchingDetail" :error="error" @close="handleCloseDetailModal" @retry="handleRetryDetail" />
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
