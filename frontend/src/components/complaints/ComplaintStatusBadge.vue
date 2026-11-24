<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        required: true,
        validator: value => {
            const validStatuses = ['open', 'progress', 'in_progress', 'in progress', 'resolved'];
            return validStatuses.includes(String(value).toLowerCase().trim());
        },
    },
    label: {
        type: String,
        default: '',
    },
});

const statusConfigMap = {
    open: {
        label: 'Open',
        classes: 'bg-status-pending-bg text-status-pending',
    },
    progress: {
        label: 'In Progress',
        classes: 'bg-blue-50 text-blue-600',
    },
    in_progress: {
        label: 'In Progress',
        classes: 'bg-blue-50 text-blue-600',
    },
    'in progress': {
        label: 'In Progress',
        classes: 'bg-blue-50 text-blue-600',
    },
    resolved: {
        label: 'Resolved',
        classes: 'bg-status-success-bg text-status-success',
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
