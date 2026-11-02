<script setup>
import { computed, watch, onUnmounted } from 'vue';
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

const lockScroll = () => {
    document.body.style.overflow = 'hidden';
};
const unlockScroll = () => {
    document.body.style.overflow = '';
};
const handleKeydown = e => {
    if (e.key === 'Escape' && props.isOpen && !props.isSubmitting) {
        emit('close');
    }
};

watch(
    () => props.isOpen,
    newVal => {
        if (newVal) {
            lockScroll();
            window.addEventListener('keydown', handleKeydown);
        } else {
            unlockScroll();
            window.removeEventListener('keydown', handleKeydown);
        }
    }
);

onUnmounted(() => {
    unlockScroll();
    window.removeEventListener('keydown', handleKeydown);
});

const recordData = computed(() => props.booking?.booking_record || {});
const roomData = computed(() => props.booking?.room || {});
const contactData = computed(() => props.booking?.contacts || {});
const paymentData = computed(() => props.booking?.payment_overview || null);

const status = computed(() => (recordData.value?.status || 'pending').toLowerCase());
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
    <Teleport to="body">
        <transition
            enter-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="isOpen" class="fixed inset-0 z-100 bg-neutral-900/50 backdrop-blur-[2px] flex justify-end" @click.self="!isSubmitting && emit('close')">
                <transition
                    appear
                    enter-active-class="transition-transform duration-300 ease-out"
                    enter-from-class="translate-x-full"
                    enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in"
                    leave-from-class="translate-x-0"
                    leave-to-class="translate-x-full"
                >
                    <div v-if="isOpen" class="w-full sm:w-full md:max-w-lg bg-bg-default h-full flex flex-col relative" role="dialog" aria-modal="true">
                        <header class="flex items-center justify-between px-10 pt-10 pb-6 shrink-0 z-10">
                            <h2 class="text-h2 text-text-primary">Booking Detail</h2>
                            <button
                                @click="!isSubmitting && emit('close')"
                                class="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors focus:outline-none cursor-pointer"
                                aria-label="Close"
                            >
                                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </header>

                        <div class="flex-1 overflow-y-auto px-10 py-10 flex flex-col gap-10 custom-scrollbar">
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

                            <BookingDetailSection v-if="paymentData && (status === 'active' || status === 'completed')" title="Payment Overview">
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
                        </div>

                        <footer class="px-10 py-8 shrink-0 flex flex-col gap-3 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-10" v-if="showFooter">
                            <template v-if="isAdmin && status === 'pending'">
                                <BaseButton variant="success" block size="md" :disabled="isSubmitting" @click="emit('approve')">Approve Booking</BaseButton>
                                <BaseButton variant="destructive" block size="md" :disabled="isSubmitting" @click="emit('reject')">Reject Booking</BaseButton>
                            </template>

                            <template v-if="isTenant && (status === 'active' || status === 'approved')">
                                <BaseButton variant="primary" block size="md" @click="emit('view-payment')">View All Payment</BaseButton>
                            </template>

                            <template v-if="isTenant && status === 'completed'">
                                <BaseButton variant="primary" block size="md" @click="emit('rebook')">Rebook this room</BaseButton>
                            </template>

                            <template v-if="isTenant && (status === 'cancelled' || status === 'rejected')">
                                <BaseButton variant="primary" block size="md" @click="emit('rebook')">Rebook this room</BaseButton>
                                <BaseButton variant="secondary" block size="md" @click="emit('browse')">Browse Available Rooms</BaseButton>
                            </template>
                        </footer>
                    </div>
                </transition>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-neutral-300, #dcdce2);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--color-neutral-500, #9b9ba6);
}
</style>
