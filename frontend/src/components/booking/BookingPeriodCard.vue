<script setup>
import { watch } from 'vue';
import AppCalendarDropdown from '@/components/common/AppCalendarDropdown.vue';

const moveInDate = defineModel('moveIn', { type: String });
const moveOutDate = defineModel('moveOut', { type: String });

const props = defineProps({
    durationMonths: {
        type: Number,
        default: 0,
    },
    errors: {
        type: Object,
        default: () => ({}),
    },
});

const emit = defineEmits(['clear', 'validate']);

watch(moveInDate, newVal => {
    emit('clear', 'moveIn');
    if (newVal) emit('validate', 'moveIn', newVal);
});

watch(moveOutDate, newVal => {
    emit('clear', 'moveOut');
    if (newVal) emit('validate', 'moveOut', newVal);
});
</script>

<template>
    <section class="bg-white border border-border-default rounded-default p-6 sm:p-10 shadow-default">
        <h2 class="text-h3 text-text-primary mb-2">Stay Period</h2>
        <p class="text-body-md text-text-secondary mb-8">Select your move-in and move-out dates to set your rental period</p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div class="space-y-4">
                <label class="text-h4 text-text-primary block">Move-in Date</label>
                <AppCalendarDropdown id="moveIn" placeholder="Select Move-in Date" v-model="moveInDate" @blur="$emit('validate', 'moveIn', moveInDate)" />
                <p v-if="errors.moveIn" class="text-body-sm text-status-error">{{ errors.moveIn }}</p>
            </div>
            <div class="space-y-4">
                <label class="text-h4 text-text-primary block">Move-out Date</label>
                <AppCalendarDropdown id="moveOut" placeholder="Select Move-out Date" v-model="moveOutDate" @blur="$emit('validate', 'moveOut', moveOutDate)" />
                <p v-if="errors.moveOut" class="text-body-sm text-status-error">{{ errors.moveOut }}</p>
            </div>
        </div>

        <div class="flex justify-end items-center gap-4 mb-10">
            <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-action-disabled"></span>
                <span class="text-body-sm text-text-disabled">Booked</span>
            </div>
            <div class="flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-neutral-900"></span>
                <span class="text-body-sm text-text-disabled">Available</span>
            </div>
        </div>

        <div class="bg-neutral-100 rounded-default px-4 py-6 flex items-center justify-between">
            <div class="flex items-center gap-2">
                <svg class="w-6 h-6 text-text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke="currentColor"
                    />
                    <path d="M12 6V12L15.5 10" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" />
                </svg>

                <span class="text-h5 text-text-primary">Rental Duration</span>
            </div>
            <span class="text-h5 text-text-primary">
                {{ durationMonths > 0 ? `${durationMonths} Month(s)` : '-' }}
            </span>
        </div>
    </section>
</template>
