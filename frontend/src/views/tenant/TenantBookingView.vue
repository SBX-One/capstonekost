<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTenantBooking } from '@/composables/useTenantBooking';
import { usePagination } from '@/composables/usePagination';
import { useRoomMeta } from '@/composables/useRoomMeta';

import AppPagination from '@/components/common/AppPagination.vue';
import TenantBookingHero from '@/components/common/TenantHero.vue';
import TenantBookingCard from '@/components/booking/TenantBookingCard.vue';
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

const route = useRoute();

const { recentBooking, historyBookings, isFetching, isMutating, error, totalCount, fetchBookings, fetchBookingDetails, cancelBooking, clearError, navigateToRoomDetail } = useTenantBooking();

const { currentPage, perPage, resetPage } = usePagination(5, newPage => {
    loadBookings(newPage);
    setTimeout(() => {
        scrollToTop();
    }, 50);
});

const { fetchRoomMeta } = useRoomMeta();

const totalPages = computed(() => Math.ceil(totalCount.value / perPage.value) || 1);

const isActionModalOpen = ref(false);
const isSuccessModalOpen = ref(false);
const isDrawerOpen = ref(false);

const isFetchingDetails = ref(false);
const localUiError = ref('');

const targetCancelId = ref(null);
const selectedDetailsCache = ref([]);
const selectedBookingForDrawer = ref({});

watch(
    () => route.query.search,
    (newSearch, oldSearch) => {
        if (newSearch !== oldSearch) {
            resetPage();
            loadBookings(1);
        }
    }
);

async function loadBookings(page = currentPage.value) {
    const currentSearch = route.query.search || '';

    const params = {
        page,
        limit: perPage.value,
        search: currentSearch,
    };
    await fetchBookings(page, params);
}

async function handleView(bookingId) {
    localUiError.value = '';
    clearError();
    isFetchingDetails.value = true;

    try {
        const details = await fetchBookingDetails([bookingId]);

        if (details && details.length > 0) {
            selectedBookingForDrawer.value = details[0];
            isDrawerOpen.value = true;
        } else {
            localUiError.value = 'Failed to load booking details. Please try again.';
        }
    } catch (err) {
        console.error('Error fetching details for drawer:', err);
        localUiError.value = err?.response?.data?.message || err.message || 'An unexpected error occurred.';
    } finally {
        isFetchingDetails.value = false;
    }
}

async function handleCancelInitiation(bookingId, isFromDrawer = false) {
    localUiError.value = '';
    clearError();
    targetCancelId.value = bookingId;

    if (!isFromDrawer) {
        isFetchingDetails.value = true;
        try {
            const details = await fetchBookingDetails([bookingId]);
            if (details && details.length > 0) {
                selectedDetailsCache.value = details;
                isActionModalOpen.value = true;
            } else {
                localUiError.value = 'Cannot initiate cancellation. Data not found.';
            }
        } catch (err) {
            localUiError.value = 'Failed to prepare cancellation.';
        } finally {
            isFetchingDetails.value = false;
        }
    } else {
        selectedDetailsCache.value = [selectedBookingForDrawer.value];
        isActionModalOpen.value = true;
        isDrawerOpen.value = false;
    }
}

async function executeCancel(cancelReason) {
    const targetId = targetCancelId.value;
    if (!targetId) return;

    const isSuccess = await cancelBooking(targetId, cancelReason);

    if (isSuccess) {
        isActionModalOpen.value = false;
        targetCancelId.value = null;
        isSuccessModalOpen.value = true;
    }
}

function handleRebook(roomId) {
    if (roomId) navigateToRoomDetail(roomId);
}

function closeSuccessModal() {
    isSuccessModalOpen.value = false;
    selectedDetailsCache.value = [];
}

onMounted(async () => {
    await Promise.all([fetchRoomMeta(), loadBookings(currentPage.value)]);
});
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen">
        <div class="mb-16">
            <TenantBookingHero />
        </div>

        <div v-if="error || localUiError" class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between animate-fade-in">
            <span class="text-body-md">{{ error || localUiError }}</span>
            <div class="flex gap-4">
                <button v-if="error" @click="loadBookings()" class="text-sm font-semibold cursor-pointer">Retry</button>
                <button v-if="localUiError" @click="localUiError = ''" class="text-sm font-semibold cursor-pointer">Dismiss</button>
            </div>
        </div>

        <div v-if="isFetching && !recentBooking && historyBookings.length === 0" class="flex justify-center py-20">
            <svg class="animate-spin h-8 w-8 text-neutral-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        </div>

        <template v-else>
            <section v-if="recentBooking" class="mb-14">
                <h2 class="text-h2 text-text-primary mb-6">Recent Booking</h2>
                <TenantBookingCard :booking="recentBooking" @view-details="handleView" @cancel="handleCancelInitiation($event, false)" @rebook="handleRebook" />
            </section>

            <section v-if="historyBookings.length > 0" class="mb-8">
                <h2 class="text-h2 text-text-primary mb-6">Booking History</h2>
                <div class="flex flex-col gap-6">
                    <TenantBookingCard
                        v-for="booking in historyBookings"
                        :key="booking.id"
                        :booking="booking"
                        @view-details="handleView"
                        @cancel="handleCancelInitiation($event, false)"
                        @rebook="handleRebook"
                    />
                </div>
            </section>

            <div v-if="!recentBooking && historyBookings.length === 0" class="py-16 text-center bg-surface-default rounded-default border border-border-default">
                <p class="text-body-lg text-text-secondary">You don't have any booking records matching your search.</p>
            </div>

            <div v-if="totalCount > 0 && totalPages > 1" class="flex flex-col sm:flex-row items-center justify-between">
                <p class="text-body-sm text-text-secondary pl-2">
                    Showing page <span class="font-semibold text-text-primary">{{ currentPage }}</span> of <span class="font-semibold text-text-primary">{{ totalPages }}</span> (<span
                        class="font-semibold text-text-primary"
                        >{{ totalCount }}</span
                    >
                    total history)
                </p>
                <AppPagination v-model="currentPage" :total-pages="totalPages" />
            </div>
        </template>

        <ActionBookingModal
            :is-open="isActionModalOpen"
            role="tenant"
            type="single"
            :selected-bookings="selectedDetailsCache"
            :is-submitting="isMutating"
            @close="isActionModalOpen = false"
            @confirm="executeCancel"
        />

        <BookingDetailDrawer
            :is-open="isDrawerOpen"
            role="tenant"
            :booking="selectedBookingForDrawer"
            :is-submitting="isMutating"
            @close="isDrawerOpen = false"
            @reject="handleCancelInitiation(selectedBookingForDrawer?.booking_record?.id, true)"
            @rebook="handleRebook(selectedBookingForDrawer?.booked_room?.id || selectedBookingForDrawer?.room?.id)"
        />

        <BookingSuccessModal :is-open="isSuccessModalOpen" action-type="cancelled" role="tenant" type="single" :selected-bookings="selectedDetailsCache" @close="closeSuccessModal" />
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
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
