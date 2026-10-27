<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAdminBooking } from '@/composables/useAdminBooking';
import { useBookingFilter } from '@/composables/useBookingFilter';
import { useRoomMeta } from '@/composables/useRoomMeta';
import { usePagination } from '@/composables/usePagination';

import BaseButton from '@/components/common/BaseButton.vue';
import AppPagination from '@/components/common/AppPagination.vue';
import AdminBookingFilterBar from '@/components/booking/AdminBookingFilterBar.vue';
import AdminBookingTable from '@/components/booking/AdminBookingTable.vue';
import AppConfirmModal from '@/components/common/AppConfirmModal.vue';
import AppSuccessModal from '@/components/common/AppSuccessModal.vue';

function scrollToTop() {
    const scrollContainer = document.querySelector('main') || document.querySelector('.overflow-y-auto') || document.documentElement;
    scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
}

const { bookings, isFetching, error, totalCount, fetchBookings, navigateToDetail } = useAdminBooking();
const { bookingStatuses, fetchRoomMeta } = useRoomMeta();

const { currentPage, perPage, resetPage } = usePagination(10, newPage => {
    loadBookings(newPage);
    setTimeout(() => {
        scrollToTop();
    }, 50);
});

const { search, status, getCleanParams } = useBookingFilter(() => {
    resetPage();
    loadBookings(1);
});

const totalPages = computed(() => {
    return Math.ceil(totalCount.value / perPage.value) || 1;
});

const selectedBookingIds = ref([]);
const hasSelection = computed(() => selectedBookingIds.value.length > 0);

const isConfirmModalOpen = ref(false);
const confirmActionType = ref('');

const isSuccessModalOpen = ref(false);
const successModalTitle = ref('Success!');
const successModalMessage = ref('');

async function loadBookings(page = currentPage.value) {
    const params = {
        page,
        limit: perPage.value,
        ...getCleanParams(),
    };
    await fetchBookings(page, params);
}

function handleView(booking) {
    navigateToDetail(booking.id);
}

function handleExport() {
    console.log('Exporting data...');
}

function handleBulkActionClick(action) {
    confirmActionType.value = action;
    isConfirmModalOpen.value = true;
}

async function confirmBulkAction() {
    const actionText = confirmActionType.value === 'approve' ? 'approved' : 'rejected';
    const count = selectedBookingIds.value.length;

    isConfirmModalOpen.value = false;

    successModalTitle.value = 'Success!';
    successModalMessage.value = `${count} selected bookings have been ${actionText} successfully.`;
    isSuccessModalOpen.value = true;

    selectedBookingIds.value = [];
}

onMounted(async () => {
    await fetchRoomMeta();
    loadBookings(currentPage.value);
});
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-16">
            <div class="flex flex-col gap-1">
                <h1 class="text-h2 text-text-primary tracking-tight">Booking List</h1>
                <p class="text-body-lg text-text-secondary">Manage tenant bookings, review requests, and track booking statuses.</p>
            </div>

            <div class="flex items-center gap-2">
                <BaseButton variant="secondary" size="md" @click="handleExport">
                    <template #icon-left>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                        </svg>
                    </template>
                    Export Data
                </BaseButton>
            </div>
        </div>

        <div class="mb-6 flex items-center">
            <div v-if="hasSelection" class="w-full flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-3 bg-white border border-border-default rounded-default animate-fade-in">
                <div class="text-body-lg font-semibold text-text-primary">{{ selectedBookingIds.length }} Selected</div>

                <div class="flex items-center gap-2">
                    <BaseButton variant="success" size="md" @click="handleBulkActionClick('approve')"> Approved Booking </BaseButton>
                    <BaseButton variant="destructive" size="md" @click="handleBulkActionClick('reject')"> Reject Booking </BaseButton>
                    <BaseButton variant="secondary" size="md" @click="handleExport"> Export Data </BaseButton>
                </div>
            </div>
            <AdminBookingFilterBar v-else v-model:search="search" v-model:status="status" :status-options="bookingStatuses" class="animate-fade-in w-full" />
        </div>

        <div v-if="error" class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between">
            <span class="text-body-md">{{ error }}</span>
            <button @click="loadBookings()" class="text-sm font-semibold cursor-pointer hover:underline">Retry</button>
        </div>

        <div class="mb-8">
            <AdminBookingTable :bookings="bookings" :is-loading="isFetching" v-model:selectedBookingIds="selectedBookingIds" @view="handleView" />
        </div>

        <div v-if="totalCount > 0" class="flex items-center justify-between">
            <p class="text-body-sm text-text-secondary pl-2">
                Showing page <span class="font-semibold text-text-primary">{{ currentPage }}</span> of <span class="font-semibold text-text-primary">{{ totalPages }}</span> (<span
                    class="font-semibold text-text-primary"
                    >{{ totalCount }}</span
                >
                total bookings)
            </p>
            <AppPagination v-model="currentPage" :total-pages="totalPages" />
        </div>

        <AppConfirmModal
            :is-open="isConfirmModalOpen"
            :title="confirmActionType === 'approve' ? 'Approve Bookings?' : 'Reject Bookings?'"
            :message="`Are you sure you want to ${confirmActionType} ${selectedBookingIds.length} selected bookings? This action cannot be undone.`"
            :confirm-text="confirmActionType === 'approve' ? 'Approve' : 'Reject'"
            cancel-text="Cancel"
            @close="isConfirmModalOpen = false"
            @confirm="confirmBulkAction"
        />

        <AppSuccessModal :is-open="isSuccessModalOpen" :title="successModalTitle" :message="successModalMessage" @close="isSuccessModalOpen = false" />
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
