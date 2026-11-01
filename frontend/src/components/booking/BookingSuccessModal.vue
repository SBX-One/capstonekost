<script setup>
import { computed, watch, onUnmounted } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import FacilityIcon from '@/components/rooms/FacilityIcon.vue';
import RoomStatusBadge from '@/components/common/RoomStatusBadge.vue';
import { getImageUrl } from '@/utils/imageUtils';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
    actionType: {
        type: String,
        required: true,
        validator: val => ['approved', 'rejected', 'cancelled'].includes(val),
    },
    role: {
        type: String,
        default: 'admin',
        validator: val => ['admin', 'tenant'].includes(val),
    },
    type: {
        type: String,
        default: 'single',
        validator: val => ['single', 'bulk'].includes(val),
    },
    selectedBookings: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['close']);

const lockScroll = () => {
    document.body.style.overflow = 'hidden';
};
const unlockScroll = () => {
    document.body.style.overflow = '';
};
const handleKeydown = e => {
    if (e.key === 'Escape' && props.isOpen) handleClose();
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

const handleClose = () => {
    emit('close');
};

const isBulk = computed(() => props.type === 'bulk');
const titleAction = computed(() => {
    return props.actionType.charAt(0).toUpperCase() + props.actionType.slice(1);
});

const modalTitle = computed(() => {
    if (isBulk.value) {
        return `${props.selectedBookings.length} Booking Requests ${titleAction.value} Successfully`;
    }
    return `Booking ${titleAction.value} Successfully`;
});

const modalDescription = computed(() => {
    const subject = isBulk.value ? 'The selected booking requests have' : 'Your booking request has';
    return `${subject} been ${props.actionType.toLowerCase()} successfully`;
});

const totalAmount = computed(() => {
    if (!props.selectedBookings.length) return 'Rp 0';
    const total = props.selectedBookings.reduce((sum, item) => sum + (item.booking_record?.total || item.total || 0), 0);
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(total);
});

const formatDate = dateString => {
    if (!dateString) return '-';
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateString));
};

const getPrimaryImage = item => {
    if (!item) return 'https://placehold.co/160x100';
    return getImageUrl(item.room?.images?.[0]?.image_path || item.booked_room?.image_paths?.[0]?.path) || 'https://placehold.co/160x100';
};

const singleBooking = computed(() => (isBulk.value || !props.selectedBookings.length ? {} : props.selectedBookings[0]));
const displayRoomType = computed(() => {
    const type = singleBooking.value.room?.room_type?.name || singleBooking.value.booked_room?.room_type?.name || 'Room';
    return type.toLowerCase().includes('room') ? type : `${type} Room`;
});
const displayRoomName = computed(() => singleBooking.value.room?.name || singleBooking.value.booked_room?.name || '-');
const displayFloor = computed(() => singleBooking.value.room?.floor || singleBooking.value.booked_room?.floor || '-');
const displayTenantName = computed(() => singleBooking.value.contacts?.name || singleBooking.value.user?.name || '-');
const displayMoveIn = computed(() => formatDate(singleBooking.value.booking_record?.move_in || singleBooking.value.move_in));
const displayMoveOut = computed(() => formatDate(singleBooking.value.booking_record?.move_out || singleBooking.value.move_out));
const displayDuration = computed(() => singleBooking.value.booking_record?.rental_duration || singleBooking.value.rental_duration || 1);
const displayAmenities = computed(() => {
    if (isBulk.value || !props.selectedBookings.length) return [];
    const room = singleBooking.value.room || singleBooking.value.booked_room || {};
    return room.facilities && Array.isArray(room.facilities) && room.facilities.length > 0 ? room.facilities.map(f => ({ name: f.name, icon_name: f.icon_name || '' })).slice(0, 4) : [];
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
            <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-neutral-900/50 backdrop-blur-[2px] p-4 sm:p-6" @click.self="handleClose">
                <transition
                    appear
                    enter-active-class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    enter-from-class="opacity-0 translate-y-8 scale-95"
                    enter-to-class="opacity-100 translate-y-0 scale-100"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 translate-y-4 scale-[0.98]"
                    leave-to-class="opacity-0 translate-y-8 scale-95"
                >
                    <div
                        v-if="isOpen"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-success-title"
                        class="bg-bg-default rounded-default w-full max-w-lg shadow-default relative flex flex-col max-h-[90vh] p-6 sm:p-8 overflow-hidden"
                    >
                        <button
                            @click="handleClose"
                            aria-label="Close modal"
                            class="absolute top-5 right-5 z-20 flex items-center justify-center w-8 h-8 bg-neutral-100 hover:bg-neutral-200 text-text-secondary hover:text-text-primary rounded-full transition-colors cursor-pointer"
                        >
                            <svg class="w-3 h-3" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.613281 0.588867L12.6133 13.0889" stroke="currentColor" stroke-width="1.7" />
                                <path d="M12.6133 0.588867L0.613281 13.0889" stroke="currentColor" stroke-width="1.7" />
                            </svg>
                        </button>

                        <header class="flex flex-col items-center text-center gap-4 my-8 shrink-0">
                            <svg class="w-15 h-15 text-status-success" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M30 2.5C14.8125 2.5 2.5 14.8125 2.5 30C2.5 45.1875 14.8125 57.5 30 57.5C45.1875 57.5 57.5 45.1875 57.5 30C57.5 14.8125 45.1875 2.5 30 2.5ZM41.92 25.35C42.1395 25.0991 42.3066 24.8068 42.4115 24.4904C42.5163 24.174 42.5569 23.8398 42.5307 23.5075C42.5045 23.1751 42.4121 22.8514 42.2589 22.5553C42.1058 22.2592 41.895 21.9968 41.6389 21.7834C41.3828 21.5699 41.0866 21.4099 40.7677 21.3127C40.4489 21.2154 40.1138 21.1829 39.7822 21.2171C39.4506 21.2512 39.1292 21.3514 38.8369 21.5116C38.5445 21.6718 38.2872 21.8889 38.08 22.15L27.33 35.0475L21.7675 29.4825C21.296 29.0271 20.6645 28.7751 20.009 28.7808C19.3535 28.7865 18.7265 29.0494 18.263 29.513C17.7994 29.9765 17.5365 30.6035 17.5308 31.259C17.5251 31.9145 17.7771 32.546 18.2325 33.0175L25.7325 40.5175C25.9781 40.763 26.2722 40.9546 26.596 41.0802C26.9198 41.2057 27.2662 41.2624 27.6132 41.2466C27.9601 41.2309 28.2999 41.143 28.611 40.9886C28.9221 40.8342 29.1976 40.6167 29.42 40.35L41.92 25.35Z"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    fill="currentColor"
                                />
                            </svg>

                            <div class="flex flex-col gap-1">
                                <h2 id="modal-success-title" class="text-h3 text-text-primary">{{ modalTitle }}</h2>
                                <p class="text-body-md text-text-secondary">
                                    {{ modalDescription }}
                                </p>
                            </div>
                        </header>

                        <div v-if="!isBulk && selectedBookings.length > 0" class="flex-1 overflow-y-auto custom-scrollbar mb-8 flex flex-col gap-8 relative">
                            <section class="w-full bg-surface-default border border-border-default p-3 rounded-default flex flex-col gap-6 text-left shrink-0">
                                <div class="flex gap-3 items-center">
                                    <img
                                        :src="getPrimaryImage(singleBooking)"
                                        class="w-24 h-24 sm:w-40 sm:h-25 object-cover rounded-default border border-border-default shrink-0"
                                        alt="Room thumbnail"
                                    />

                                    <div class="flex flex-col justify-center min-w-0 gap-1 w-full">
                                        <span class="text-h4 text-text-primary truncate">{{ displayRoomType }}</span>
                                        <span class="text-body-sm text-text-secondary truncate">Room {{ displayRoomName }} • Floor {{ displayFloor }}</span>

                                        <span v-if="role === 'admin'" class="text-body-md text-text-secondary truncate mt-2">
                                            Tenant: <span class="font-medium text-text-primary">{{ displayTenantName }}</span>
                                        </span>
                                        <div v-if="role === 'tenant' && displayAmenities.length" class="flex flex-wrap gap-x-6 gap-y-1 text-body-sm text-text-primary font-medium mt-2">
                                            <div v-for="(item, idx) in displayAmenities" :key="idx" class="flex items-center gap-2">
                                                <FacilityIcon :name="item.icon_name" class="w-4 h-4 shrink-0 text-text-secondary" />
                                                {{ item.name }}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="w-full border-t border-border-default"></div>
                                <div class="flex justify-between text-left text-body-sm">
                                    <div class="flex flex-col gap-1">
                                        <span class="text-text-secondary">Move-in</span>
                                        <span class="text-body-md text-text-primary">{{ displayMoveIn }}</span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <span class="text-text-secondary">Move-out</span>
                                        <span class="text-body-md text-text-primary">{{ displayMoveOut }}</span>
                                    </div>
                                    <div class="flex flex-col gap-1 text-right">
                                        <span class="text-text-secondary">{{ role === 'admin' ? 'Status' : 'Duration' }}</span>
                                        <RoomStatusBadge v-if="role === 'admin'" :status="actionType" class="ml-auto mt-0.5" />
                                        <span v-else class="text-body-md text-text-primary">{{ displayDuration }} Months</span>
                                    </div>
                                </div>

                                <div class="w-full border-t border-border-default"></div>

                                <div class="flex justify-between items-center w-full">
                                    <span class="text-body-md text-text-secondary">Total Amount</span>
                                    <span class="text-h4 text-text-primary">{{ totalAmount }}</span>
                                </div>
                            </section>
                        </div>

                        <footer class="flex w-full gap-4 shrink-0 z-10">
                            <BaseButton variant="primary" size="md" :block="true" @click="handleClose"> Back to Booking {{ isBulk ? 'List' : 'History' }} </BaseButton>
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
