<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        required: true,
        validator: value => {
            const validStatuses = ['unpaid', 'partial', 'partially paid', 'partially_paid', 'overdue', 'paid', 'canceled', 'cancelled'];
            return validStatuses.includes(String(value).toLowerCase().trim());
        },
    },
    label: {
        type: String,
        default: '',
    },
});

const statusConfigMap = {
    unpaid: {
        label: 'Unpaid',
        classes: 'bg-status-pending-bg text-status-pending',
    },
    partial: {
        label: 'Partially Paid',
        classes: 'bg-blue-50 text-blue-600',
    },
    'partially paid': {
        label: 'Partially Paid',
        classes: 'bg-blue-50 text-blue-600',
    },
    partially_paid: {
        label: 'Partially Paid',
        classes: 'bg-blue-50 text-blue-600',
    },
    overdue: {
        label: 'Overdue',
        classes: 'bg-status-error-bg text-status-error',
    },
    paid: {
        label: 'Paid',
        classes: 'bg-status-success-bg text-status-success',
    },
    canceled: {
        label: 'Canceled',
        classes: 'bg-status-error-bg text-status-error',
    },
    cancelled: {
        label: 'Canceled',
        classes: 'bg-status-error-bg text-status-error',
    },
};

const normalizedVariant = computed(() => String(props.status).toLowerCase().trim());

const badgeClasses = computed(() => {
    return statusConfigMap[normalizedVariant.value]?.classes || 'bg-neutral-200 text-text-secondary';
});

const displayLabel = computed(() => {
    if (props.label) return props.label;
    return statusConfigMap[normalizedVariant.value]?.label || props.status;
});
</script>

<template>
    <span class="inline-flex items-center justify-center px-3 py-1 text-label-badge rounded-xl tracking-wide select-none shrink-0" :class="badgeClasses">
        {{ displayLabel }}
    </span>
</template>
