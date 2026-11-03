<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import DashboardBaseCard from '@/components/dashboard/DashboardBaseCard.vue';

const props = defineProps({
    pending: {
        type: Number,
        default: 0,
    },
    approved: {
        type: Number,
        default: 0,
    },
    active: {
        type: Number,
        default: 0,
    },
    completed: {
        type: Number,
        default: 0,
    },
    cancelled: {
        type: Number,
        default: 0,
    },
    rejected: {
        type: Number,
        default: 0,
    },
});

const animatedValues = ref({
    pending: 0,
    approved: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
});

const maxStatusValue = computed(() => {
    const actualMax = Math.max(props.pending, props.approved, props.active, props.completed, props.cancelled, props.rejected);
    return Math.max(actualMax, 5);
});

const getBarWidth = value => {
    return `${(value / maxStatusValue.value) * 100}%`;
};

const statusItems = computed(() => [
    { key: 'pending', label: 'Pending', rawValue: props.pending },
    { key: 'approved', label: 'Approved', rawValue: props.approved },
    { key: 'active', label: 'Active', rawValue: props.active },
    { key: 'completed', label: 'Completed', rawValue: props.completed },
    { key: 'cancelled', label: 'Cancelled', rawValue: props.cancelled },
    { key: 'rejected', label: 'Rejected', rawValue: props.rejected },
]);

const triggerAnimation = () => {
    setTimeout(() => {
        animatedValues.value = {
            pending: props.pending,
            approved: props.approved,
            active: props.active,
            completed: props.completed,
            cancelled: props.cancelled,
            rejected: props.rejected,
        };
    }, 100);
};

onMounted(() => {
    triggerAnimation();
});

watch(
    () => [props.pending, props.approved, props.active, props.completed, props.cancelled, props.rejected],
    () => {
        triggerAnimation();
    }
);
</script>

<template>
    <DashboardBaseCard title="Booking Status Overview" subtitle="Number of booking by status">
        <ul class="grid grid-cols-[max-content_1fr_max-content] gap-y-4 gap-x-4 h-full m-0 p-0 list-none">
            <li v-for="item in statusItems" :key="item.key" class="contents">
                <span class="text-body-md text-text-primary font-medium">
                    {{ item.label }}
                </span>

                <div
                    class="h-3 rounded-full bg-neutral-300 relative overflow-hidden flex items-center"
                    role="progressbar"
                    :aria-valuenow="item.rawValue"
                    aria-valuemin="0"
                    :aria-valuemax="maxStatusValue"
                    :aria-label="`Number of ${item.label} bookings`"
                >
                    <div
                        class="absolute top-0 left-0 h-full bg-neutral-900 rounded-full"
                        style="transition: width 1s cubic-bezier(0.22, 1, 0.36, 1)"
                        :style="{ width: getBarWidth(animatedValues[item.key]) }"
                    ></div>
                </div>

                <span class="text-body-md text-text-primary font-medium text-right tabular-nums min-w-[2ch]" aria-hidden="true">
                    {{ item.rawValue }}
                </span>
            </li>
        </ul>
    </DashboardBaseCard>
</template>
