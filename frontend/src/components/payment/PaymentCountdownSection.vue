<script setup>
import { computed } from 'vue';

const props = defineProps({
    remainingTime: {
        type: String,
        required: true,
    },
    deadlineLabel: {
        type: String,
        required: true,
    },
    isApproaching: {
        type: Boolean,
        default: false,
    },
    isExpired: {
        type: Boolean,
        default: false,
    },
});

const timerColorClass = computed(() => {
    if (props.isExpired) return 'text-status-error';
    if (props.isApproaching) return 'text-amber-500';
    return 'text-text-inverse';
});
</script>

<template>
    <section aria-labelledby="countdown-heading" class="flex flex-col gap-6">
        <div class="flex items-start sm:items-center gap-4">
            <svg class="w-10 h-10 text-text-primary shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                    d="M20.0003 8.33333C23.5365 8.33333 26.9279 9.73809 29.4284 12.2386C31.9289 14.7391 33.3337 18.1304 33.3337 21.6667C33.3337 25.2029 31.9289 28.5943 29.4284 31.0948C26.9279 33.5952 23.5365 35 20.0003 35C16.4641 35 13.0727 33.5952 10.5722 31.0948C8.07175 28.5943 6.66699 25.2029 6.66699 21.6667C6.66699 18.1304 8.07175 14.7391 10.5722 12.2386C13.0727 9.73809 16.4641 8.33333 20.0003 8.33333ZM20.0003 8.33333V5M16.667 5H20.0003M20.0003 5H23.3337M30.0003 11.6667L33.3337 8.33333M20.0003 21.6667V15"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke="currentColor"
                />
            </svg>

            <div class="flex flex-col gap-2">
                <h2 id="countdown-heading" class="text-h3 text-text-primary tracking-tight">Initial Payment Countdown</h2>
                <p class="text-body-lg text-text-secondary">The initial payment must be recorded by the admin within 24 hours after booking approval</p>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-neutral-900 rounded-default p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-2">
                <span class="text-body-lg text-text-inverse">Remaining Time</span>
                <time class="text-3xl sm:text-h1 tabular-nums tracking-tight transition-colors" :class="timerColorClass" aria-live="off">
                    {{ remainingTime }}
                </time>
            </div>

            <div class="bg-neutral-900 rounded-default p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-2">
                <span class="text-body-lg text-text-inverse">Payment Deadline</span>
                <strong class="text-3xl sm:text-h1 text-text-inverse tracking-tight">
                    {{ deadlineLabel }}
                </strong>
            </div>
        </div>

        <div v-if="isApproaching" role="status" class="bg-amber-50 border border-amber-500 rounded-default p-4 flex items-center gap-4 animate-fade-in">
            <svg class="w-10 h-10 text-amber-500 shrink-0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path
                    d="M19.9997 14.9995V23.3328M19.9914 28.3328H20.0064M19.9997 35.6828H9.89973C4.11639 35.6828 1.69973 31.5495 4.49973 26.4995L9.69973 17.1328L14.5997 8.33281C17.5664 2.98281 22.4331 2.98281 25.3997 8.33281L30.2997 17.1495L35.4997 26.5161C38.2997 31.5661 35.8664 35.6995 30.0997 35.6995H19.9997V35.6828Z"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke="currentColor"
                />
            </svg>
            <span class="w-px self-stretch bg-amber-500 shrink-0" aria-hidden="true"></span>
            <div class="flex flex-col">
                <strong class="text-h5 text-text-primary">Payment deadline is approaching</strong>
                <p class="text-body-md text-text-secondary">Please complete your initial payment before the time runs out</p>
            </div>
        </div>

        <div v-else-if="isExpired" role="alert" class="bg-status-error-bg border border-status-error rounded-default p-4 flex items-center gap-4 animate-fade-in">
            <svg class="w-10 h-10 text-status-error shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path stroke-linecap="round" d="M12 8v4m0 4h.01" />
            </svg>
            <span class="w-px self-stretch bg-status-error shrink-0" aria-hidden="true"></span>
            <div class="flex flex-col">
                <strong class="text-h5 text-status-error">Payment deadline has passed</strong>
                <p class="text-body-md text-status-error">The 24-hour window for initial payment has expired. Please check your booking history or contact the property admin.</p>
            </div>
        </div>
    </section>
</template>
