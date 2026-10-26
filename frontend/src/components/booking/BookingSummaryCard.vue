<script setup>
import { computed, ref } from 'vue';
import dayjs from 'dayjs';
import BaseButton from '@/components/common/BaseButton.vue';
import FacilityIcon from '@/components/rooms/FacilityIcon.vue';
import { getImageUrl } from '@/utils/imageUtils';

const props = defineProps({
    room: {
        type: Object,
        required: true,
    },
    moveIn: {
        type: String,
        default: '',
    },
    moveOut: {
        type: String,
        default: '',
    },
    duration: {
        type: Number,
        default: 0,
    },
    totalPrice: {
        type: Number,
        default: 0,
    },
    isValid: {
        type: Boolean,
        default: false,
    },
    isSubmitting: {
        type: Boolean,
        default: false,
    },
    formatRupiah: {
        type: Function,
        required: true,
    },
});

defineEmits(['submit']);

const imageError = ref(false);
const mainImageUrl = computed(() => {
    if (!props.room?.image_paths || props.room.image_paths.length === 0) {
        return null;
    }

    const images = props.room.image_paths;
    const primaryImage = images.find(img => img.sort_order === 1);
    const selectedImagePath = primaryImage ? primaryImage.path : images[0].path;

    return getImageUrl(selectedImagePath);
});

const handleImageError = () => {
    imageError.value = true;
};
</script>

<template>
    <section class="bg-white border border-border-default rounded-default px-8 py-10 shadow-default sticky top-24">
        <h2 class="text-h3 text-text-primary mb-2">Booking Summary</h2>
        <p class="text-body-md text-text-secondary mb-8">Review your room and booking details</p>

        <div class="aspect-video w-full rounded-default overflow-hidden mb-6 border border-border-default bg-neutral-200">
            <template v-if="mainImageUrl && !imageError">
                <img :src="mainImageUrl" alt="Room preview" class="w-full h-full object-cover" @error="handleImageError" />
            </template>
            <template v-else>
                <svg class="w-12 h-12 text-text-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    ></path>
                </svg>
            </template>
        </div>

        <div class="flex flex-col gap-8">
            <div class="flex justify-between items-start">
                <div class="flex flex-col gap-1">
                    <h3 class="text-h4 text-text-primary">{{ room.room_type?.name || 'Standard Room' }}</h3>
                    <p class="text-body-sm text-text-secondary">Room {{ room.name }} &bull; Floor {{ room.floor }}</p>
                </div>
                <div class="text-right flex flex-col gap-1">
                    <p class="text-body-sm text-text-secondary">monthly rent</p>
                    <p class="text-h4 font-bold text-text-primary">{{ formatRupiah(room?.price) }}</p>
                </div>
            </div>

            <div v-if="room?.facilities?.length" class="flex flex-col gap-4">
                <p class="text-h5 text-text-primary">Room Facilities</p>
                <div class="flex flex-wrap gap-3">
                    <span
                        v-for="facility in room.facilities"
                        :key="facility.id || facility"
                        class="inline-flex items-center gap-2 px-3 py-1.5 rounded-default bg-neutral-100 text-body-sm text-text-primary"
                    >
                        <FacilityIcon :name="facility.name || facility" />
                        <span>{{ facility.name || facility }}</span>
                    </span>
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <h3 class="text-h4 text-text-primary">Booking Details</h3>
                <div class="flex flex-col gap-4 p-3 bg-neutral-100 rounded-default">
                    <div class="flex justify-between items-center text-body-md">
                        <span class="text-text-secondary">Move-in</span>
                        <span class="text-text-primary">{{ moveIn ? dayjs(moveIn).format('D MMM YYYY') : '-' }}</span>
                    </div>
                    <div class="flex justify-between items-center text-body-md">
                        <span class="text-text-secondary">Move-out</span>
                        <span class="text-text-primary">{{ moveOut ? dayjs(moveOut).format('D MMM YYYY') : 'Not Selected' }}</span>
                    </div>
                    <div class="flex justify-between items-center text-body-md">
                        <span class="text-text-secondary">Rental Duration</span>
                        <span class="text-text-primary">{{ duration > 0 ? `${duration} Month(s)` : '-' }}</span>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-4 p-3 bg-neutral-100 rounded-default">
                <div class="flex justify-between items-center text-body-md">
                    <span class="text-text-secondary">Monthly Rent</span>
                    <span class="text-text-primary">{{ formatRupiah(room?.price) }}</span>
                </div>
                <div class="flex justify-between items-center text-body-md">
                    <span class="text-text-secondary">Rental Price</span>
                    <span class="text-text-primary">
                        {{ duration > 0 && room?.price ? `${room.price.toLocaleString('id-ID')} x ${duration}` : '-' }}
                    </span>
                </div>
            </div>

            <div class="flex justify-between items-center">
                <span class="text-h4 text-text-primary">Total</span>
                <span class="text-h3 font-bold text-text-primary">{{ totalPrice > 0 ? formatRupiah(totalPrice) : '-' }}</span>
            </div>

            <div class="flex flex-col gap-6">
                <div v-if="totalPrice === 0" class="bg-neutral-100 rounded-default p-4 flex items-start gap-3">
                    <svg class="w-5 h-5 text-text-secondary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p class="text-label-btn-md text-text-secondary">Select your move-out date to calculate the total rental price.</p>
                </div>

                <div class="flex flex-col gap-4">
                    <BaseButton @click="$emit('submit')" :variant="isValid && !isSubmitting ? 'primary' : 'disabled'" :disabled="!isValid || isSubmitting" size="md" block>
                        {{ isSubmitting ? 'Submitting...' : 'Submit Booking Request' }}
                    </BaseButton>
                    <p class="text-center text-label-btn-md text-text-secondary">Your Request will be reviewed by Admin.</p>
                </div>
            </div>
        </div>
    </section>
</template>
