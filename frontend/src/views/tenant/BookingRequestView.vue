<script setup>
import { reactive, computed, watch, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import dayjs from 'dayjs';

import BookingContactCard from '@/components/booking/BookingContactCard.vue';
import BookingPeriodCard from '@/components/booking/BookingPeriodCard.vue';
import BookingSummaryCard from '@/components/booking/BookingSummaryCard.vue';

import { useAuthStore } from '@/stores/authStore';
import { useTenantRoom } from '@/composables/useTenantRoom';
import { useBookingValidation } from '@/composables/useBookingValidation';

const props = defineProps({
    id: {
        type: [String, Number],
        required: true,
    },
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { fetchTenantRoomById, getRoomById, isFetching, formatRupiah } = useTenantRoom();

const roomDetail = computed(() => getRoomById(props.id));
const isSubmitting = ref(false);

const form = reactive({
    fullName: '',
    phoneNumber: '',
    email: '',
    moveIn: route.query.moveIn || '',
    moveOut: '',
});

const { validateAll, validateField, errors, setFieldError, isValid } = useBookingValidation(form);

watch(
    () => authStore.user,
    newUser => {
        if (newUser) {
            form.fullName = newUser.name || '';
            form.phoneNumber = newUser.phone || '';
            form.email = newUser.email || '';
        }
    },
    { immediate: true }
);

const rentalDurationMonths = computed(() => {
    if (!form.moveIn || !form.moveOut) return 0;

    const start = dayjs(form.moveIn).startOf('day');
    const end = dayjs(form.moveOut).startOf('day');

    if (!start.isValid() || !end.isValid() || end.isBefore(start) || end.isSame(start)) return 0;

    const exactMonths = end.diff(start, 'month', true);
    return exactMonths > 0 ? Math.ceil(exactMonths) : 1;
});

const totalPrice = computed(() => {
    if (rentalDurationMonths.value === 0 || !roomDetail.value?.price) return 0;
    return rentalDurationMonths.value * roomDetail.value.price;
});

const isSubmitDisabled = computed(() => {
    return !isValid.value || isFetching.value || isSubmitting.value || rentalDurationMonths.value === 0;
});

onMounted(async () => {
    try {
        await fetchTenantRoomById(props.id);
        if (!roomDetail.value) {
            router.replace({ name: 'public-rooms' });
        }
    } catch (error) {
        console.error('Failed to load room details:', error);
        router.replace({ name: 'public-rooms' });
    }
});

const handleBack = () => router.back();

const handleSubmit = async () => {
    if (!validateAll(form)) return;

    isSubmitting.value = true;

    const payload = {
        room_id: Number(props.id),
        move_in: form.moveIn,
        move_out: form.moveOut,
        total_price: totalPrice.value,
        tenant_contact: {
            fullName: form.fullName,
            phoneNumber: form.phoneNumber,
            email: form.email,
        },
    };

    try {
        console.log('Submitting booking to API...', payload);
        await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
        console.error('Booking failed:', error);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="min-h-screen bg-bg-default px-6 md:px-12 py-8 md:py-1200" :aria-busy="isFetching">
        <button @click="handleBack" class="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 w-fit cursor-pointer focus:outline-none">
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33301 10H16.6663" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor" />
                <path d="M8.33301 5L3.33301 10L8.33301 15" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor" />
            </svg>
            <span class="text-body-lg font-medium">Back to Room Detail</span>
        </button>

        <div class="flex flex-col gap-1 mb-8">
            <h1 class="text-h2 text-text-primary tracking-tight">Book Your Room</h1>
            <p class="text-body-lg text-text-secondary">Fill in your details and select your preferred stay dates to submit your booking request.</p>
        </div>

        <div v-if="isFetching && !roomDetail" class="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-pulse" aria-busy="true" aria-label="Loading room details">
            <div class="lg:col-span-8 flex flex-col gap-6">
                <div class="bg-white border border-border-default rounded-default p-6 sm:p-10 shadow-default">
                    <div class="h-8 bg-neutral-200 rounded-md w-1/3 mb-2"></div>
                    <div class="h-5 bg-neutral-200 rounded-md w-1/2 md:w-1/3 mb-8"></div>
                    <div class="space-y-6">
                        <div class="space-y-2">
                            <div class="h-5 bg-neutral-200 rounded-md w-1/4"></div>
                            <div class="h-12 bg-neutral-200 rounded-md w-full"></div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div v-for="i in 2" :key="'contact-input-' + i" class="space-y-2">
                                <div class="h-5 bg-neutral-200 rounded-md w-1/3"></div>
                                <div class="h-12 bg-neutral-200 rounded-md w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-white border border-border-default rounded-default p-6 sm:p-10 shadow-default">
                    <div class="h-8 bg-neutral-200 rounded-md w-1/3 mb-2"></div>
                    <div class="h-5 bg-neutral-200 rounded-md w-2/3 md:w-1/2 mb-8"></div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div v-for="i in 2" :key="'date-input-' + i" class="space-y-4">
                            <div class="h-6 bg-neutral-200 rounded-md w-1/3"></div>
                            <div class="h-12 bg-neutral-200 rounded-md w-full"></div>
                        </div>
                    </div>

                    <div class="flex justify-end items-center gap-4 mb-10">
                        <div v-for="i in 2" :key="'legend-' + i" class="h-4 bg-neutral-200 rounded-md w-16"></div>
                    </div>

                    <div class="bg-neutral-100 rounded-default px-4 py-6 flex items-center justify-between">
                        <div class="flex items-center gap-2 w-1/2">
                            <div class="h-6 w-6 bg-neutral-200 rounded-md shrink-0"></div>
                            <div class="h-6 bg-neutral-200 rounded-md w-1/2"></div>
                        </div>
                        <div class="h-6 bg-neutral-200 rounded-md w-1/4"></div>
                    </div>
                </div>
            </div>

            <div class="lg:col-span-4">
                <div class="bg-white border border-border-default rounded-default px-8 py-10 shadow-default sticky top-24">
                    <div class="h-8 bg-neutral-200 rounded-md w-2/3 mb-2"></div>
                    <div class="h-5 bg-neutral-200 rounded-md w-5/6 mb-8"></div>

                    <div class="aspect-video w-full rounded-default bg-neutral-200 mb-6 border border-border-default"></div>

                    <div class="flex flex-col gap-8">
                        <div class="flex justify-between items-start">
                            <div class="flex flex-col gap-1 w-1/2">
                                <div class="h-7 bg-neutral-200 rounded-md w-3/4"></div>
                                <div class="h-4 bg-neutral-200 rounded-md w-full mt-1"></div>
                            </div>
                            <div class="flex flex-col gap-1 items-end w-1/3">
                                <div class="h-4 bg-neutral-200 rounded-md w-3/4 mb-1"></div>
                                <div class="h-7 bg-neutral-200 rounded-md w-full"></div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4">
                            <div class="h-6 bg-neutral-200 rounded-md w-1/2"></div>
                            <div class="flex flex-wrap gap-3">
                                <div v-for="i in 3" :key="'fac-' + i" class="h-8 bg-neutral-200 rounded-default" :class="i === 2 ? 'w-20' : i === 3 ? 'w-28' : 'w-24'"></div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4">
                            <div class="h-7 bg-neutral-200 rounded-md w-1/2"></div>
                            <div class="flex flex-col gap-4 p-3 bg-neutral-100 rounded-default">
                                <div v-for="i in 3" :key="'det-' + i" class="flex justify-between items-center">
                                    <div class="h-5 bg-neutral-200 rounded-md" :class="i % 2 === 0 ? 'w-1/3' : 'w-1/4'"></div>
                                    <div class="h-5 bg-neutral-200 rounded-md" :class="i % 2 === 0 ? 'w-1/4' : 'w-1/3'"></div>
                                </div>
                            </div>
                        </div>

                        <div class="flex flex-col gap-4 p-3 bg-neutral-100 rounded-default">
                            <div v-for="i in 2" :key="'rent-' + i" class="flex justify-between items-center">
                                <div class="h-5 bg-neutral-200 rounded-md" :class="i === 1 ? 'w-1/3' : 'w-1/4'"></div>
                                <div class="h-5 bg-neutral-200 rounded-md" :class="i === 1 ? 'w-1/4' : 'w-1/3'"></div>
                            </div>
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="h-7 bg-neutral-200 rounded-md w-1/4"></div>
                            <div class="h-8 bg-neutral-200 rounded-md w-1/3"></div>
                        </div>

                        <div class="flex flex-col gap-6">
                            <div class="bg-neutral-100 rounded-default p-4 flex items-start gap-3">
                                <div class="w-5 h-5 bg-neutral-200 rounded-md shrink-0 mt-0.5"></div>
                                <div class="w-full flex flex-col gap-2">
                                    <div class="h-4 bg-neutral-200 rounded-md w-full"></div>
                                    <div class="h-4 bg-neutral-200 rounded-md w-2/3"></div>
                                </div>
                            </div>
                            <div class="flex flex-col gap-4">
                                <div class="h-11 bg-neutral-200 rounded-md w-full"></div>
                                <div class="h-4 bg-neutral-200 rounded-md w-2/3 mx-auto"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="roomDetail" class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-8 flex flex-col gap-6">
                <BookingContactCard v-model="form" :errors="errors" @clear="setFieldError" @validate="validateField" />

                <BookingPeriodCard
                    v-model:move-in="form.moveIn"
                    v-model:move-out="form.moveOut"
                    :duration-months="rentalDurationMonths"
                    :errors="errors"
                    @clear="setFieldError"
                    @validate="validateField"
                />
            </div>

            <div class="lg:col-span-4">
                <BookingSummaryCard
                    :room="roomDetail"
                    :move-in="form.moveIn"
                    :move-out="form.moveOut"
                    :duration="rentalDurationMonths"
                    :total-price="totalPrice"
                    :is-valid="!isSubmitDisabled"
                    :is-submitting="isSubmitting"
                    :format-rupiah="formatRupiah"
                    @submit="handleSubmit"
                />
            </div>
        </div>
    </div>
</template>
