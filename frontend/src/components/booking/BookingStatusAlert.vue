<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        required: true,
        validator: val => ['pending', 'approved', 'active', 'complete', 'cancelled', 'rejected'].includes(val.toLowerCase()),
    },
    role: {
        type: String,
        default: 'tenant',
        validator: val => ['admin', 'tenant'].includes(val),
    },
});

const statusConfig = computed(() => {
    const normalizedStatus = props.status.toLowerCase();
    const isTenant = props.role === 'tenant';

    const dictionary = {
        pending: {
            style: 'bg-status-pending-bg border-status-pending text-status-pending',
            iconType: 'clock',
            title: isTenant ? 'Awaiting Admin Approval' : 'Awaiting Your Approval',
            desc: isTenant
                ? 'Your monthly boarding reservation is currently under review by Kosanmu Admin. Allocation confirmation typically takes 2-6 hours.'
                : 'This booking request is awaiting your review and approval.',
        },
        approved: {
            style: 'bg-status-success-bg border-status-success text-status-success',
            iconType: 'check',
            title: 'Booking Approved',
            desc: isTenant ? 'Your booking request has been approved by Kosanmu Admin. Please complete the payment to confirm your booking.' : 'You have approved this booking request.',
        },
        active: {
            style: 'bg-status-success-bg border-status-success text-status-success',
            iconType: 'check',
            title: isTenant ? 'Your stay is in progress' : 'Booking Active',
            desc: isTenant ? 'Your booking is active and your stay has started.' : 'The tenant is currently staying in this room.',
        },
        complete: {
            style: 'bg-neutral-100 border-neutral-300 text-text-secondary',
            iconType: 'check',
            title: isTenant ? 'Your Stay Has Ended' : 'Period complete',
            desc: isTenant
                ? 'Your rental period is complete. Thank you for staying with KOSANMU! Want to stay again? Rebook your room for a new rental period.'
                : "The tenant's rental period has ended.",
        },
        rejected: {
            style: 'bg-status-error-bg border-status-error text-status-error',
            iconType: 'cross',
            title: 'Booking Rejected',
            desc: isTenant ? 'Your booking request has been rejected by Kosanmu Admin.' : 'This booking has been rejected.',
        },
        cancelled: {
            style: 'bg-status-error-bg border-status-error text-status-error',
            iconType: 'cross',
            title: 'Booking Cancelled',
            desc: isTenant ? 'Your booking has been cancelled. You can explore available rooms or make a new booking anytime.' : 'This booking has been cancelled.',
        },
    };

    return dictionary[normalizedStatus] || { style: '', iconType: '', title: '', desc: '' };
});
</script>

<template>
    <div class="flex items-start px-3 py-4 gap-4 border rounded-default w-full" :class="statusConfig.style">
        <div class="shrink-0 mt-0.5 flex items-center justify-center text-current" aria-hidden="true">
            <svg v-if="statusConfig.iconType === 'clock'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke="currentColor"
                />
                <path d="M12 6V12L15.5 10" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" />
            </svg>

            <svg v-else-if="statusConfig.iconType === 'check'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M23 12C23 18.075 18.075 23 12 23C5.925 23 1 18.075 1 12C1 5.925 5.925 1 12 1C18.075 1 23 5.925 23 12ZM7 13L8.5 11.5L10.5 13.5L15.5 8.5L17 10L10.5 16.5L7 13Z"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    fill="currentColor"
                />
            </svg>

            <svg v-else-if="statusConfig.iconType === 'cross'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12 2C6.47 2 2 6.47 2 12C2 17.53 6.47 22 12 22C17.53 22 22 17.53 22 12C22 6.47 17.53 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20ZM15.59 7L12 10.59L8.41 7L7 8.41L10.59 12L7 15.59L8.41 17L12 13.41L15.59 17L17 15.59L13.41 12L17 8.41L15.59 7Z"
                    fill="currentColor"
                />
            </svg>
        </div>

        <div class="flex flex-col gap-2">
            <h4 class="text-h5 text-current">{{ statusConfig.title }}</h4>
            <p class="text-body-md text-current">{{ statusConfig.desc }}</p>
        </div>
    </div>
</template>
