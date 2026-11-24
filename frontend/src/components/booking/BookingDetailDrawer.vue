<script setup>
import { computed } from 'vue';
import AppDrawer from '@/components/common/AppDrawer.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import FacilityIcon from '@/components/rooms/FacilityIcon.vue';
import BookingStatusAlert from '@/components/booking/BookingStatusAlert.vue';
import BookingDetailSection from '@/components/booking/BookingDetailSection.vue';
import { getImageUrl } from '@/utils/imageUtils';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: 'tenant',
        validator: val => ['admin', 'tenant'].includes(val),
    },
    booking: {
        type: Object,
        default: () => ({}),
    },
    isSubmitting: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close', 'approve', 'reject', 'view-payment', 'rebook', 'browse']);

const recordData = computed(() => props.booking?.booking_record || {});
const roomData = computed(() => props.booking?.room || {});
const contactData = computed(() => props.booking?.contacts || {});
const paymentData = computed(() => props.booking?.payment_overview || null);

const status = computed(() => (recordData.value?.status || 'pending').toLowerCase().trim());
const isCompleted = computed(() => status.value === 'completed' || status.value === 'complete');
const isTenant = computed(() => props.role === 'tenant');
const isAdmin = computed(() => props.role === 'admin');

const formatCurrency = val => {
    if (!val) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
};
const formatDate = dateString => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateString));
};

const primaryImage = computed(() => getImageUrl(roomData.value?.images?.[0]?.image_path || roomData.value?.image_paths?.[0]?.path) || 'https://placehold.co/400x200');
const roomType = computed(() => roomData.value?.room_type?.name || 'Room');
const roomTitle = computed(() => `${roomType.value} Room`);
const roomSubtitle = computed(() => `Room ${roomData.value?.name || '-'} • Floor ${roomData.value?.floor || '-'}`);
const facilities = computed(() => roomData.value?.facilities || []);

const moveIn = computed(() => formatDate(recordData.value?.move_in));
const moveOut = computed(() => formatDate(recordData.value?.move_out));
const duration = computed(() => recordData.value?.rental_duration || 0);

const cancelReason = computed(() => {
    const reasonData = props.booking?.cancellation_reason || props.booking?.reject_reason;
    if (!reasonData) return null;

    if (typeof reasonData === 'string') return reasonData;
    if (Array.isArray(reasonData)) {
        return reasonData.length > 0 ? reasonData[0].reason || reasonData[0].value : null;
    }

    return reasonData.reason || reasonData.value || null;
});

const showFooter = computed(() => {
    if (isAdmin.value && status.value !== 'pending') return false;
    return true;
});
</script>

<template>
    <AppDrawer :is-open="isOpen" title="Booking Detail" :persistent="isSubmitting" @close="emit('close')">
        <section class="flex flex-col gap-4">
            <img :src="primaryImage" alt="Room Thumbnail" class="w-full aspect-video object-cover rounded-default" />
            <div class="flex flex-col gap-2">
                <h3 class="text-h4 text-text-primary">{{ roomTitle }}</h3>
                <p class="text-body-sm text-text-secondary">{{ roomSubtitle }}</p>
            </div>
        </section>

        <section v-if="facilities.length" class="flex flex-col gap-4">
            <h3 class="text-h5 font-semibold text-text-secondary">Room Facilities</h3>
            <div class="flex flex-wrap gap-3">
                <div v-for="fac in facilities" :key="fac.id" class="inline-flex items-center gap-2 px-3 py-1.5 rounded-default bg-neutral-100 text-body-sm text-text-primary">
                    <FacilityIcon :name="fac.icon_name || fac.name" />
                    <span>{{ fac.name }}</span>
                </div>
            </div>
        </section>

        <BookingStatusAlert :status="status" :role="role" />

        <BookingDetailSection v-if="(status === 'cancelled' || status === 'rejected') && cancelReason" title="Cancellation Reason">
            <p class="text-body-md text-text-primary">{{ cancelReason }}</p>
        </BookingDetailSection>

        <BookingDetailSection title="Rental Dates and Period">
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Move-in</span>
                <span class="text-text-primary">{{ moveIn }}</span>
            </div>
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Move-out</span>
                <span class="text-text-primary">{{ moveOut }}</span>
            </div>
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Rental Duration</span>
                <span class="text-text-primary">{{ duration }} {{ duration > 1 ? 'Months' : 'Month' }}</span>
            </div>
        </BookingDetailSection>

        <BookingDetailSection title="Contact Details">
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Full Name</span>
                <span class="text-text-primary text-right max-w-[60%] truncate">{{ contactData.name || '-' }}</span>
            </div>
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Phone Number</span>
                <span class="text-text-primary">{{ contactData.phone || '-' }}</span>
            </div>
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Email Address</span>
                <span class="text-text-primary text-right max-w-[60%] truncate">{{ contactData.email || '-' }}</span>
            </div>
        </BookingDetailSection>

        <BookingDetailSection title="Rental Summary">
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Monthly Rent</span>
                <span class="text-text-primary">{{ formatCurrency(roomData.price) }}</span>
            </div>
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Rental Price</span>
                <span class="text-text-primary">{{ formatCurrency(roomData.price) }} x {{ duration }}</span>
            </div>
            <div class="flex justify-between items-center pt-6 border-t border-border-default">
                <span class="text-h5 text-text-primary">Total</span>
                <span class="text-h4 text-text-primary">{{ formatCurrency(recordData.total) }}</span>
            </div>
        </BookingDetailSection>

        <BookingDetailSection v-if="paymentData && (status === 'active' || isCompleted)" title="Payment Overview">
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Latest Payment</span>
                <span class="text-text-primary">{{ formatDate(paymentData.latest_payment) }}</span>
            </div>
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Status</span>
                <span class="text-text-primary capitalize">{{ paymentData.status || '-' }}</span>
            </div>
            <div class="flex justify-between items-center text-body-md">
                <span class="text-text-secondary">Next due date</span>
                <span class="text-text-primary">{{ formatDate(paymentData.next_due_date) }}</span>
            </div>
            <div class="flex justify-between items-center pt-6 border-t border-border-default">
                <span class="text-h5 text-text-primary">Price</span>
                <span class="text-h4 text-text-primary">{{ formatCurrency(paymentData.amount) }}</span>
            </div>
        </BookingDetailSection>

        <template v-if="showFooter" #footer>
            <template v-if="isAdmin && status === 'pending'">
                <BaseButton variant="success" block size="md" :disabled="isSubmitting" @click="emit('approve')">Approve Booking</BaseButton>
                <BaseButton variant="destructive" block size="md" :disabled="isSubmitting" @click="emit('reject')">Reject Booking</BaseButton>
            </template>

            <template v-if="isTenant && (status === 'active' || status === 'approved')">
                <BaseButton variant="primary" block size="md" @click="emit('view-payment')">View All Payment</BaseButton>
            </template>

            <template v-if="isTenant && isCompleted">
                <BaseButton variant="primary" block size="md" @click="emit('rebook')">Rebook this room</BaseButton>
            </template>

            <template v-if="isTenant && (status === 'cancelled' || status === 'rejected')">
                <BaseButton variant="primary" block size="md" @click="emit('rebook')">Rebook this room</BaseButton>
                <BaseButton variant="secondary" block size="md" @click="emit('browse')">Browse Available Rooms</BaseButton>
            </template>
        </template>
    </AppDrawer>
</template>
