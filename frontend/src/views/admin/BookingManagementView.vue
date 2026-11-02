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
import ActionBookingModal from '@/components/booking/ActionBookingModal.vue';
import BookingSuccessModal from '@/components/booking/BookingSuccessModal.vue';
import BookingDetailDrawer from '@/components/booking/BookingDetailDrawer.vue';

function scrollToTop() {
    const scrollContainer = document.querySelector('main') || document.querySelector('.overflow-y-auto') || document.documentElement;
    scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
    });
}

const { bookings, isFetching, isMutating, error, totalCount, fetchBookings, fetchBookingDetails, approveBookings, rejectBookings, clearError } = useAdminBooking();
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

const totalPages = computed(() => Math.ceil(totalCount.value / perPage.value) || 1);
const selectedBookingIds = ref([]);
const hasSelection = computed(() => selectedBookingIds.value.length > 0);
const isFetchingDetails = ref(false);

const isActionModalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const isDrawerOpen = ref(false);

const currentActionType = ref('');
const selectedDetailsCache = ref([]);
const selectedBookingForDrawer = ref({});

const localUiError = ref('');

async function loadBookings(page = currentPage.value) {
    const params = {
        page,
        limit: perPage.value,
        ...getCleanParams(),
    };
    await fetchBookings(page, params);
}

async function handleView(booking) {
    localUiError.value = '';
    clearError();
    isFetchingDetails.value = true;

    try {
        const details = await fetchBookingDetails([booking.id]);

        if (details && details.length > 0) {
            selectedBookingForDrawer.value = details[0];
            isDrawerOpen.value = true;
        } else {
            localUiError.value = 'Failed to load booking details.';
        }
    } catch (err) {
        console.error('Error fetching details for drawer:', err);
        localUiError.value = err?.response?.data?.message || err.message || 'An unexpected error occurred.';
    } finally {
        isFetchingDetails.value = false;
    }
}

function handleExport() {
    console.log('Exporting data...');
}

async function handleAction(actionType, targetIds = selectedBookingIds.value) {
    localUiError.value = '';
    clearError();

    if (!targetIds.length) return;

    const validPendingIds = targetIds.filter(id => {
        const bookingItem = bookings.value.find(b => b.id === id);
        return bookingItem && bookingItem.booking_records?.status === 'pending';
    });

    if (validPendingIds.length === 0) {
        localUiError.value = 'Only bookings with "Pending" status can be approved or rejected.';
        selectedBookingIds.value = [];
        return;
    }

    currentActionType.value = actionType;
    isFetchingDetails.value = true;

    const details = await fetchBookingDetails(validPendingIds);
    selectedDetailsCache.value = details;
    isFetchingDetails.value = false;

    if (actionType === 'reject') {
        isActionModalOpen.value = true;
    } else if (actionType === 'approve') {
        executeAction(actionType, '', false);
    }
}

async function executeAction(actionType, rejectReason = '', isFromDrawer = false) {
    const targetIds = isFromDrawer ? [selectedBookingForDrawer.value.booking_record?.id] : selectedDetailsCache.value.map(item => item.booking_record?.id || item.id);
    let isSuccess = false;

    if (actionType === 'reject') {
        isSuccess = await rejectBookings(targetIds, rejectReason);
    } else if (actionType === 'approve') {
        isSuccess = await approveBookings(targetIds);
    }

    if (isSuccess) {
        selectedBookingIds.value = [];
        isActionModalOpen.value = false;
        isDrawerOpen.value = false;

        if (isFromDrawer) {
            selectedDetailsCache.value = [selectedBookingForDrawer.value];
            currentActionType.value = actionType;
        }

        isSuccessModalOpen.value = true;
    }
}

function handleDrawerApprove() {
    executeAction('approve', '', true);
}

function handleDrawerReject() {
    selectedDetailsCache.value = [selectedBookingForDrawer.value];
    currentActionType.value = 'reject';
    isActionModalOpen.value = true;

    isDrawerOpen.value = false;
}

function closeSuccessModal() {
    isSuccessModalOpen.value = false;
    selectedDetailsCache.value = [];
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
                    <BaseButton variant="success" size="md" @click="handleAction('approve')" :disabled="isFetchingDetails || isMutating">
                        <span v-if="isFetchingDetails && currentActionType === 'approve'" class="flex items-center gap-2">
                            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </span>
                        <span v-else>Approve Booking</span>
                    </BaseButton>

                    <BaseButton variant="destructive" size="md" @click="handleAction('reject')" :disabled="isFetchingDetails || isMutating">
                        <span v-if="isFetchingDetails && currentActionType === 'reject'" class="flex items-center gap-2">
                            <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Loading...
                        </span>
                        <span v-else>Reject Booking</span>
                    </BaseButton>

                    <BaseButton variant="secondary" size="md" @click="handleExport"> Export Data </BaseButton>
                </div>
            </div>
            <AdminBookingFilterBar v-else v-model:search="search" v-model:status="status" :status-options="bookingStatuses" class="animate-fade-in w-full" />
        </div>

        <div v-if="error || localUiError" class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between">
            <span class="text-body-md">{{ error || localUiError }}</span>
            <button v-if="error" @click="loadBookings()" class="text-sm font-semibold cursor-pointer">Retry</button>
            <button v-if="localUiError" @click="localUiError = ''" class="text-sm font-semibold cursor-pointer">Dismiss</button>
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

        <ActionBookingModal
            :is-open="isActionModalOpen"
            role="admin"
            :type="selectedDetailsCache.length > 1 ? 'bulk' : 'single'"
            :selected-bookings="selectedDetailsCache"
            :is-submitting="isMutating"
            @close="isActionModalOpen = false"
            @confirm="reason => executeAction('reject', reason)"
        />

        <BookingDetailDrawer
            :is-open="isDrawerOpen"
            role="admin"
            :booking="selectedBookingForDrawer"
            :is-submitting="isMutating"
            @close="isDrawerOpen = false"
            @approve="handleDrawerApprove"
            @reject="handleDrawerReject"
        />

        <BookingSuccessModal
            :is-open="isSuccessModalOpen"
            :action-type="currentActionType === 'approve' ? 'approved' : 'rejected'"
            role="admin"
            :type="selectedDetailsCache.length > 1 ? 'bulk' : 'single'"
            :selected-bookings="selectedDetailsCache"
            @close="closeSuccessModal"
        />
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
