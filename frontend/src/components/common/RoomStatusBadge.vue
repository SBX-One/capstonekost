<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        required: true,
        validator: value => {
            const validStatuses = ['available', 'occupied', 'pending', 'active', 'completed', 'rejected', 'canceled'];
            return validStatuses.includes(value.toLowerCase().trim());
        },
    },
});

const statusClassMap = {
    available: 'bg-status-success-bg text-status-success',
    active: 'bg-status-success-bg text-status-success',
    pending: 'bg-status-pending-bg text-status-pending',
    occupied: 'bg-neutral-200 text-text-secondary',
    completed: 'bg-neutral-200 text-text-secondary',
    rejected: 'bg-status-error-bg text-status-error',
    canceled: 'bg-status-error-bg text-status-error',
};

const badgeClasses = computed(() => {
    const variant = props.status.toLowerCase().trim();
    return statusClassMap[variant] || 'bg-neutral-200 text-neutral-700';
});
</script>

<template>
    <span class="inline-flex items-center justify-center px-3 py-1 text-label-badge rounded-default tracking-wide select-none shrink-0 capitalize" :class="badgeClasses">
        {{ status }}
    </span>
</template>
