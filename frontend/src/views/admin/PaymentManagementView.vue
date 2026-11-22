<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAdminPayment } from '@/composables/useAdminPayment';
import { usePagination } from '@/composables/usePagination';

import BaseButton from '@/components/common/BaseButton.vue';
import AppPagination from '@/components/common/AppPagination.vue';
import AdminPaymentTable from '@/components/payment/AdminPaymentTable.vue';
import PaymentDetailModal from '@/components/payment/PaymentDetailModal.vue';

const router = useRouter();

const { formattedPayments, isFetching, isFetchingDetail, error, totalCount, getPaymentDetailById, fetchPayments, fetchPaymentDetails, clearError } = useAdminPayment();

let latestRequestId = 0;
let scrollTimeoutId = null;

const isDetailModalOpen = ref(false);
const isExportModalOpen = ref(false);
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

const { currentPage, perPage, setPage } = usePagination(9, newPage => {
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

async function loadPayments(page = currentPage.value) {
    const requestId = ++latestRequestId;
    clearError();

    await fetchPayments(page, {
        limit: perPage.value,
    });

    if (requestId !== latestRequestId) return;

    if (!error.value && safeTotalCount.value > 0 && page > totalPages.value) {
        setPage(totalPages.value, safeTotalCount.value);
    }
}

async function handleViewDetail(payment) {
    const paymentId = payment?.id;
    if (!paymentId) return;

    clearError();
    selectedPaymentId.value = paymentId;
    isDetailModalOpen.value = true;
    await fetchPaymentDetails([paymentId]);
}

function handleCloseDetailModal() {
    isDetailModalOpen.value = false;
    selectedPaymentId.value = null;
    clearError();
}

async function handleRetryDetail() {
    if (!selectedPaymentId.value) return;
    clearError();
    await fetchPaymentDetails([selectedPaymentId.value]);
}

function handleOpenExportModal() {
    clearError();
    isExportModalOpen.value = true;
}

function handleNavigateToRecord() {
    router.push({ name: 'admin-payment-record' }).catch(() => {
        router.push('/admin/payments/record');
    });
}

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
        <header class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-16">
            <div class="flex flex-col gap-1">
                <h1 class="text-h2 text-text-primary tracking-tight">Payment Management</h1>
                <p class="text-body-lg text-text-secondary">Manage and track tenant payment transactions</p>
            </div>

            <div class="flex items-center gap-2 shrink-0">
                <BaseButton variant="secondary" size="md" @click="handleOpenExportModal"> Export Data </BaseButton>
            </div>
        </header>

        <section aria-labelledby="payment-transactions-heading">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div class="flex flex-col gap-1">
                    <h2 id="payment-transactions-heading" class="text-h3 text-text-primary tracking-tight">Payment Transactions</h2>
                    <p class="text-body-md text-text-secondary">View all recorded payment transactions</p>
                </div>

                <BaseButton variant="secondary" size="md" @click="handleNavigateToRecord">
                    <template #icon-left>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                    </template>
                    Record Payment
                </BaseButton>
            </div>

            <div
                v-if="error && !isDetailModalOpen && !isExportModalOpen"
                role="alert"
                class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between gap-4"
            >
                <span class="text-body-md">{{ error }}</span>
                <button type="button" @click="loadPayments()" class="text-sm font-semibold cursor-pointer shrink-0 focus:outline-none">Retry</button>
            </div>

            <div class="mb-8">
                <AdminPaymentTable :payments="formattedPayments" :is-loading="isFetching" @view="handleViewDetail" />
            </div>

            <div v-if="safeTotalCount > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <p class="text-body-sm text-text-secondary pl-2">
                    Showing page <span class="font-semibold text-text-primary">{{ currentPage }}</span> of <span class="font-semibold text-text-primary">{{ totalPages }}</span> (<span
                        class="font-semibold text-text-primary"
                        >{{ safeTotalCount }}</span
                    >
                    total payments)
                </p>
                <AppPagination v-model="currentPage" :total-pages="totalPages" />
            </div>
        </section>

        <PaymentDetailModal
            :is-open="isDetailModalOpen"
            role="admin"
            :payment="selectedPaymentDetail"
            :is-loading="isFetchingDetail"
            :error="error"
            @close="handleCloseDetailModal"
            @retry="handleRetryDetail"
        />
    </div>
</template>
