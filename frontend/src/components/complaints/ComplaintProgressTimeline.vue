<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        default: 'open',
    },
    role: {
        type: String,
        default: 'tenant',
        validator: val => ['admin', 'tenant'].includes(val),
    },
    timeline: {
        type: Object,
        default: () => ({
            submittedAt: '',
            inProgressAt: '',
            resolvedAt: '',
        }),
    },
});

const STEP_COPY = {
    tenant: {
        submitted: 'Your report has been successfully submitted and is waiting for admin review.',
        inProgressActive: 'Our team has started working on your reported issue.',
        inProgressPending: 'Your report will be handled by our admin team.',
        resolvedActive: 'The reported issue has been addressed.',
        resolvedPending: 'Your reported issue will be marked as resolved once it has been addressed.',
    },
    admin: {
        submitted: 'Report submitted by tenant.',
        inProgressActive: 'Started handling reported issues.',
        inProgressPending: 'Not started yet.',
        resolvedActive: 'The reported issue has been addressed.',
        resolvedPending: 'Not resolved yet.',
    },
};

const normalizedStatus = computed(() => {
    const raw = String(props.status || 'open')
        .toLowerCase()
        .trim();
    if (['progress', 'in_progress', 'in progress'].includes(raw)) return 'in_progress';
    if (raw === 'resolved') return 'resolved';
    return 'open';
});

const steps = computed(() => {
    const copy = STEP_COPY[props.role] || STEP_COPY.tenant;
    const isInProgress = normalizedStatus.value === 'in_progress' || normalizedStatus.value === 'resolved';
    const isResolved = normalizedStatus.value === 'resolved';
    const timelineData = props.timeline || {};

    return [
        {
            key: 'submitted',
            title: 'Report Submitted',
            completed: true,
            description: copy.submitted,
            date: timelineData.submittedAt || '',
        },
        {
            key: 'in_progress',
            title: 'In Progress',
            completed: isInProgress,
            description: isInProgress ? copy.inProgressActive : copy.inProgressPending,
            date: isInProgress ? timelineData.inProgressAt || '' : '',
        },
        {
            key: 'resolved',
            title: 'Resolved',
            completed: isResolved,
            description: isResolved ? copy.resolvedActive : copy.resolvedPending,
            date: isResolved ? timelineData.resolvedAt || '' : '',
        },
    ];
});
</script>

<template>
    <section class="flex flex-col gap-4 w-full shrink-0">
        <h4 class="text-h5 font-semibold text-text-secondary">Report Progress</h4>

        <ol class="w-full bg-neutral-100 rounded-default p-3 flex flex-col gap-3">
            <li v-for="(step, index) in steps" :key="step.key" class="flex items-stretch gap-3">
                <div class="w-6 flex flex-col items-center shrink-0">
                    <span
                        class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                        :class="step.completed ? 'bg-blue-600 text-white' : 'bg-neutral-300'"
                        aria-hidden="true"
                    >
                        <svg v-if="step.completed" class="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11.6663 3.5L5.24967 9.91667L2.33301 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                    </span>

                    <span v-if="index < steps.length - 1" class="w-px flex-1 min-h-6 bg-border-default my-1.5" aria-hidden="true"></span>
                </div>

                <div class="flex flex-col gap-2 flex-1 min-w-0" :class="index < steps.length - 1 ? 'pb-1' : ''">
                    <p class="text-h5 text-text-primary">{{ step.title }}</p>
                    <p class="text-body-sm text-text-secondary">{{ step.description }}</p>
                    <p v-if="step.date" class="text-body-sm text-text-secondary">{{ step.date }}</p>
                </div>
            </li>
        </ol>
    </section>
</template>
