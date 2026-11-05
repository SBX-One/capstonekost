<script setup>
import { computed } from 'vue';
import { getImageUrl } from '@/utils/imageUtils';
import RoomStatusBadge from '@/components/common/RoomStatusBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
    booking: {
        type: Object,
        required: true,
    },
});

defineEmits(['cancel', 'view-details', 'rebook']);

const formatCurrency = amount => {
    if (amount === undefined || amount === null) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

const formatDate = dateString => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

const roomInfo = computed(() => props.booking.booked_room || props.booking.room || {});
const bookingInfo = computed(() => props.booking.booking_records || props.booking || {});

const roomImage = computed(() => {
    const paths = roomInfo.value.image_paths;
    if (paths && paths.length > 0) {
        return getImageUrl(paths[0].path || paths[0].image_path);
    }
    return '';
});

const roomTitle = computed(() => roomInfo.value.room_type?.name + ' Room' || 'Room');
const roomSubtitle = computed(() => `Room ${roomInfo.value.name || '-'} • Floor ${roomInfo.value.floor || '-'}`);

const moveIn = computed(() => formatDate(bookingInfo.value.move_in));
const moveOut = computed(() => formatDate(bookingInfo.value.move_out));
const duration = computed(() => `${bookingInfo.value.rental_duration || 0} Months`);
const monthlyRent = computed(() => formatCurrency(roomInfo.value.price));
const totalRent = computed(() => formatCurrency(bookingInfo.value.total));
const status = computed(() => (bookingInfo.value.status || 'pending').toLowerCase());
</script>

<template>
    <article class="w-full bg-bg-default border border-border-default rounded-default p-4 md:p-8 flex flex-col md:flex-row gap-6 transition-all">
        <div class="w-full md:w-64 shrink-0 aspect-video md:aspect-4/3 bg-neutral-200 rounded-default overflow-hidden">
            <img v-if="roomImage" :src="roomImage" :alt="`Image of ${roomTitle}`" class="w-full h-full object-cover" loading="lazy" />
            <div v-else class="w-full h-full flex items-center justify-center text-text-disabled">
                <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                </svg>
            </div>
        </div>

        <div class="flex-1 flex flex-col gap-8 justify-between">
            <header class="flex justify-between items-start gap-4">
                <div class="flex flex-col gap-1">
                    <h3 class="text-h4 text-text-primary tracking-tight">{{ roomTitle }}</h3>
                    <p class="text-body-sm text-text-secondary">{{ roomSubtitle }}</p>
                </div>
                <RoomStatusBadge :status="status" />
            </header>

            <div class="w-full bg-surface-default rounded-default px-3 py-4 grid grid-cols-2 md:grid-cols-4 gap-6">
                <div class="flex flex-col gap-2">
                    <span class="text-body-sm text-text-secondary">Move-in</span>
                    <strong class="text-h5 text-text-primary font-semibold">{{ moveIn }}</strong>
                </div>
                <div class="flex flex-col gap-2">
                    <span class="text-body-sm text-text-secondary">Move-out</span>
                    <strong class="text-h5 text-text-primary font-semibold">{{ moveOut }}</strong>
                </div>
                <div class="flex flex-col gap-2">
                    <span class="text-body-sm text-text-secondary">Rental Duration</span>
                    <strong class="text-h5 text-text-primary font-semibold">{{ duration }}</strong>
                </div>
                <div class="flex flex-col gap-2">
                    <span class="text-body-sm text-text-secondary">Monthly Rent</span>
                    <strong class="text-h5 text-text-primary font-semibold">{{ monthlyRent }}</strong>
                </div>
            </div>

            <footer class="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mt-auto">
                <div class="flex flex-col gap-2">
                    <span class="text-h5 text-text-secondary">Total</span>
                    <strong class="text-h3 text-text-primary tracking-tight">{{ totalRent }}</strong>
                </div>

                <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                    <BaseButton v-if="status === 'pending'" variant="destructive" size="sm" @click="$emit('cancel', booking.id)" class="flex-1 sm:flex-none"> Cancel Booking </BaseButton>
                    <BaseButton v-if="status === 'completed'" variant="primary" size="sm" @click="$emit('rebook', roomInfo.id)" class="flex-1 sm:flex-none"> Rebook this room </BaseButton>
                    <BaseButton v-if="status !== 'pending'" variant="secondary" size="sm" @click="$emit('view-details', booking.id)" class="flex-1 sm:flex-none"> View Details </BaseButton>
                    <BaseButton v-if="status === 'pending'" variant="primary" size="sm" @click="$emit('view-details', booking.id)" class="flex-1 sm:flex-none"> View Details </BaseButton>
                </div>
            </footer>
        </div>
    </article>
</template>
