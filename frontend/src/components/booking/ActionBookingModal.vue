<script setup>
import { computed, watch, reactive, onUnmounted, nextTick } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import AppDropdown from '@/components/common/AppDropdown.vue';
import FacilityIcon from '@/components/rooms/FacilityIcon.vue';
import { useActionBookingValidation } from '@/composables/useActionBookingValidation';
import { sanitizeText } from '@/utils/sanitizers';
import { getImageUrl } from '@/utils/imageUtils';
import { useRoomMeta } from '@/composables/useRoomMeta';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
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
    isSubmitting: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close', 'confirm']);

const formData = reactive({
    reasonDropdown: '',
    reasonText: '',
});

const { cancelReasons, rejectReasons } = useRoomMeta();
const { errors, validateField, validateAll, clearErrors } = useActionBookingValidation(props.role, formData);

const lockScroll = () => {
    document.body.style.overflow = 'hidden';
};
const unlockScroll = () => {
    document.body.style.overflow = '';
};
const handleKeydown = e => {
    if (e.key === 'Escape' && props.isOpen && !props.isSubmitting) handleClose();
};

watch(
    () => props.isOpen,
    async newVal => {
        if (newVal) {
            lockScroll();
            formData.reasonDropdown = '';
            formData.reasonText = '';
            await nextTick();
            clearErrors();
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

const reasonOptions = computed(() => (props.role === 'admin' ? rejectReasons.value : cancelReasons.value));
const isBulk = computed(() => props.type === 'bulk');
const actionText = computed(() => (props.role === 'admin' ? 'Reject' : 'Cancel'));
const bookingCountText = computed(() => (isBulk.value ? `${props.selectedBookings.length} Booking Requests` : 'Booking Request'));
const totalAmount = computed(() => {
    const total = props.selectedBookings.reduce((sum, item) => sum + (item.booking_record?.total || item.total || 0), 0);
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(total);
});

const showOtherTextArea = computed(() => props.role === 'admin' && formData.reasonDropdown === 'Others');

const isFormValid = computed(() => {
    if (!formData.reasonDropdown) return false;
    if (showOtherTextArea.value && !formData.reasonText.trim()) return false;
    return true;
});

watch(
    () => formData.reasonDropdown,
    newVal => {
        validateField('reasonDropdown', newVal);
        if (newVal !== 'Others' || props.role === 'tenant') {
            formData.reasonText = '';
            errors.reasonText = '';
        }
    }
);

watch(
    () => formData.reasonText,
    newVal => {
        if (showOtherTextArea.value) {
            validateField('reasonText', newVal);
        }
    }
);

const handleClose = () => {
    if (!props.isSubmitting) emit('close');
};

const handleConfirm = () => {
    if (props.isSubmitting) return;

    const isValid = validateAll(formData);
    if (!isValid) return;

    const rawReason = showOtherTextArea.value ? formData.reasonText : formData.reasonDropdown;
    const sanitizedReason = sanitizeText(rawReason);
    emit('confirm', sanitizedReason);
};

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
                        aria-labelledby="modal-action-title"
                        class="bg-bg-default rounded-default w-full max-w-lg shadow-default relative flex flex-col max-h-[90vh] p-6 sm:p-8 overflow-hidden"
                    >
                        <button
                            @click="handleClose"
                            aria-label="Close modal"
                            class="absolute top-5 right-5 z-20 flex items-center justify-center w-8 h-8 bg-neutral-100 hover:bg-neutral-200 text-text-secondary hover:text-text-primary rounded-full transition-colors cursor-pointer"
                            :disabled="isSubmitting"
                        >
                            <svg class="w-3 h-3" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0.613281 0.588867L12.6133 13.0889" stroke="currentColor" stroke-width="1.7" />
                                <path d="M12.6133 0.588867L0.613281 13.0889" stroke="currentColor" stroke-width="1.7" />
                            </svg>
                        </button>

                        <header class="flex flex-col items-center text-center gap-4 my-8 shrink-0">
                            <div class="w-15 h-15 bg-red-50 text-action-destructive rounded-default flex items-center justify-center shrink-0" aria-hidden="true">
                                <svg class="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M20 4.5835C18.3691 4.5835 16.9785 5.62521 16.4631 7.08338C16.233 7.73428 15.5189 8.07545 14.868 7.84538C14.2171 7.61531 13.8759 6.90116 14.106 6.25028C14.9634 3.82448 17.2768 2.0835 20 2.0835C22.7233 2.0835 25.0366 3.82448 25.8941 6.25028C26.1241 6.90116 25.783 7.61531 25.1321 7.84538C24.4811 8.07545 23.767 7.73428 23.537 7.08338C23.0216 5.62521 21.6308 4.5835 20 4.5835Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M4.58301 10C4.58301 9.30965 5.14266 8.75 5.83301 8.75H34.1665C34.8568 8.75 35.4165 9.30965 35.4165 10C35.4165 10.6903 34.8568 11.25 34.1665 11.25H5.83301C5.14266 11.25 4.58301 10.6903 4.58301 10Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M9.8586 14.0839C9.81268 13.3951 9.21705 12.8739 8.52823 12.9198C7.8394 12.9657 7.31821 13.5614 7.36415 14.2502L8.13656 25.8364C8.27905 27.9744 8.39415 29.7012 8.6641 31.0564C8.94476 32.4652 9.42213 33.642 10.4081 34.5644C11.3941 35.4869 12.6 35.8849 14.0244 36.0712C15.3945 36.2504 17.1253 36.2504 19.268 36.2504H20.7326C22.8753 36.2504 24.606 36.2504 25.9761 36.0712C27.4005 35.8849 28.6065 35.4869 29.5925 34.5644C30.5785 33.642 31.0558 32.4652 31.3365 31.0564C31.6063 29.7012 31.7215 27.9744 31.864 25.8364L32.6365 14.2502C32.6823 13.5614 32.1611 12.9657 31.4723 12.9198C30.7835 12.8739 30.1878 13.3951 30.142 14.0839L29.3753 25.5824C29.2256 27.8289 29.1188 29.3919 28.8846 30.5679C28.6573 31.7087 28.3401 32.3125 27.8845 32.7389C27.4288 33.165 26.8051 33.4415 25.6518 33.5924C24.4628 33.7479 22.8961 33.7504 20.6448 33.7504H19.3558C17.1045 33.7504 15.5377 33.7479 14.3487 33.5924C13.1954 33.4415 12.5718 33.165 12.1161 32.7389C11.6604 32.3125 11.3432 31.7087 11.1159 30.5679C10.8816 29.3919 10.7749 27.8289 10.6252 25.5824L9.8586 14.0839Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M15.7087 17.0898C16.3957 17.0211 17.0081 17.5223 17.077 18.2093L17.9103 26.5426C17.979 27.2295 17.4778 27.8421 16.7908 27.9108C16.1039 27.9795 15.4913 27.4783 15.4226 26.7913L14.5893 18.458C14.5206 17.7711 15.0218 17.1585 15.7087 17.0898Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M25.4103 18.458C25.479 17.7711 24.9778 17.1585 24.2908 17.0898C23.604 17.0211 22.9913 17.5223 22.9226 18.2093L22.0893 26.5426C22.0206 27.2295 22.5218 27.8421 23.2088 27.9108C23.8956 27.9795 24.5081 27.4783 24.577 26.7913L25.4103 18.458Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                            <div class="flex flex-col gap-1">
                                <h2 id="modal-action-title" class="text-h3 text-text-primary">{{ actionText }} {{ bookingCountText }}?</h2>
                                <p class="text-body-md text-text-secondary">
                                    Are you sure you want to {{ actionText.toLowerCase() }} {{ isBulk ? 'these' : 'this' }} request{{ isBulk ? 's' : '' }}? This action cannot be undone.
                                </p>
                            </div>
                        </header>

                        <div class="flex-1 overflow-y-auto custom-scrollbar mb-8 flex flex-col gap-8 relative">
                            <section class="w-full bg-surface-default border border-border-default p-3 rounded-default flex flex-col gap-6 text-left shrink-0">
                                <div v-if="isBulk" class="flex flex-col gap-4">
                                    <div class="flex justify-between items-center text-h5 text-text-primary">
                                        <span>Selected Bookings</span>
                                        <span class="bg-neutral-200 px-2 py-1 rounded-default text-label-badge">{{ selectedBookings.length }} Items</span>
                                    </div>
                                    <div class="flex items-center gap-2 w-full" aria-hidden="true">
                                        <div class="grid grid-cols-4 gap-2 flex-1">
                                            <img
                                                v-for="(item, index) in selectedBookings.slice(0, 4)"
                                                :key="item.booking_record?.id || index"
                                                :src="getPrimaryImage(item)"
                                                class="w-full aspect-4/3 object-cover rounded-default border border-border-default"
                                                alt=""
                                            />
                                        </div>
                                        <span v-if="selectedBookings.length > 4" class="text-label-btn-lg font-semibold text-text-primary px-4 shrink-0"> +{{ selectedBookings.length - 4 }} </span>
                                    </div>
                                </div>

                                <div v-else class="flex gap-3 items-center">
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

                                <div v-if="!isBulk" class="w-full border-t border-border-default"></div>
                                <div v-if="!isBulk" class="flex justify-between text-left text-body-sm">
                                    <div class="flex flex-col gap-1">
                                        <span class="text-text-secondary">Move-in</span>
                                        <span class="text-body-md text-text-primary">{{ displayMoveIn }}</span>
                                    </div>
                                    <div class="flex flex-col gap-1">
                                        <span class="text-text-secondary">Move-out</span>
                                        <span class="text-body-md text-text-primary">{{ displayMoveOut }}</span>
                                    </div>
                                    <div class="flex flex-col gap-1 text-right">
                                        <span class="text-text-secondary">Duration</span>
                                        <span class="text-body-md text-text-primary">{{ displayDuration }} Months</span>
                                    </div>
                                </div>

                                <div class="w-full border-t border-border-default"></div>

                                <div class="flex justify-between items-center w-full">
                                    <span class="text-body-md text-text-secondary">Total Amount</span>
                                    <span class="text-h4 text-text-primary">{{ totalAmount }}</span>
                                </div>
                            </section>

                            <div class="w-full flex flex-col gap-2 text-left shrink-0">
                                <label class="text-h5 text-text-primary"> Select Reason<span class="text-status-error" aria-hidden="true">*</span> </label>
                                <AppDropdown v-model="formData.reasonDropdown" :options="reasonOptions" placeholder="Choose a valid reason..." size="md" />
                                <span v-if="errors.reasonDropdown" class="text-body-sm text-status-error -mt-1" role="alert">{{ errors.reasonDropdown }}</span>
                                <span v-if="isBulk && !errors.reasonDropdown" class="text-xs text-text-secondary mt-1">This reason applies to all {{ selectedBookings.length }} items.</span>

                                <transition
                                    enter-active-class="transition-all duration-300 ease-out"
                                    enter-from-class="opacity-0 -translate-y-2 max-h-0"
                                    enter-to-class="opacity-100 translate-y-0 max-h-32"
                                    leave-active-class="transition-all duration-200 ease-in"
                                    leave-from-class="opacity-100 translate-y-0 max-h-32"
                                    leave-to-class="opacity-0 -translate-y-2 max-h-0"
                                >
                                    <div v-if="showOtherTextArea" class="mt-3 flex flex-col gap-1">
                                        <BaseInput
                                            v-model="formData.reasonText"
                                            type="textarea"
                                            placeholder="Please specify your specific reason..."
                                            :rows="3"
                                            :error="errors.reasonText"
                                            @blur="validateField('reasonText', formData.reasonText)"
                                        />
                                    </div>
                                </transition>
                            </div>
                        </div>

                        <footer class="flex w-full gap-4 shrink-0 z-10">
                            <BaseButton variant="secondary" size="md" class="flex-1" @click="handleClose" :disabled="isSubmitting"> Cancel </BaseButton>
                            <BaseButton variant="destructive" size="md" class="flex-1 relative" @click="handleConfirm" :disabled="!isFormValid || isSubmitting" aria-live="polite">
                                <span :class="{ 'opacity-0': isSubmitting }"> {{ actionText }} {{ isBulk ? 'All' : 'Booking' }} </span>
                                <span v-if="isSubmitting" class="absolute inset-0 flex items-center justify-center">
                                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-label="Processing">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path
                                            class="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                </span>
                            </BaseButton>
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
