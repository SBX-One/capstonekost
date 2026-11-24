<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        required: true,
        validator: val => ['open', 'progress', 'in_progress', 'in progress', 'resolved'].includes(String(val).toLowerCase().trim()),
    },
    role: {
        type: String,
        default: 'tenant',
        validator: val => ['admin', 'tenant'].includes(val),
    },
});

const normalizedStatus = computed(() => {
    const raw = String(props.status || 'open')
        .toLowerCase()
        .trim();
    if (['progress', 'in_progress', 'in progress'].includes(raw)) return 'in_progress';
    if (raw === 'resolved') return 'resolved';
    return 'open';
});

const statusConfig = computed(() => {
    const isTenant = props.role === 'tenant';

    const dictionary = {
        open: {
            style: 'bg-status-pending-bg border-status-pending text-status-pending',
            iconType: 'clock',
            title: isTenant ? 'Waiting for Review' : 'Open',
            desc: isTenant ? 'Your report has been submitted and is waiting to be reviewed by our admin team.' : 'A new issue report has been submitted and is ready for review.',
        },
        in_progress: {
            style: 'bg-blue-50 border-blue-600 text-blue-600',
            iconType: 'progress',
            title: 'In Progress',
            desc: isTenant
                ? 'Our admin team is currently working on your reported issue. We will keep you updated on its progress.'
                : 'The assigned team is currently working on this issue. Follow up to ensure it is resolved.',
        },
        resolved: {
            style: 'bg-status-success-bg border-status-success text-status-success',
            iconType: 'check',
            title: 'Resolved',
            desc: isTenant
                ? 'Your reported issue has been addressed. Thank you for bringing this matter to our attention.'
                : 'This issue has been successfully resolved. Review the resolution details for reference.',
        },
    };

    return dictionary[normalizedStatus.value];
});
</script>

<template>
    <div role="status" class="flex items-start px-3 py-4 gap-4 border rounded-default w-full" :class="statusConfig.style">
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

            <svg v-else-if="statusConfig.iconType === 'progress'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M20.0903 17.8789C19.4735 18.7279 18.7269 19.4745 17.8779 20.0913"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke="currentColor"
                    stroke-opacity="0.48"
                />
                <path d="M12 22C6.4772 22 2 17.5229 2 12C2 6.4772 6.4772 2 12 2C17.5228 2 22 6.4772 22 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" />
            </svg>

            <svg v-else-if="statusConfig.iconType === 'check'" class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M23 12C23 18.075 18.075 23 12 23C5.925 23 1 18.075 1 12C1 5.925 5.925 1 12 1C18.075 1 23 5.925 23 12ZM7 13L8.5 11.5L10.5 13.5L15.5 8.5L17 10L10.5 16.5L7 13Z"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
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
