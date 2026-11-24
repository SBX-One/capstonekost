<script setup>
import BaseButton from '@/components/common/BaseButton.vue';
import AdminComplaintTableRow from '@/components/complaints/AdminComplaintTableRow.vue';

defineProps({
    issues: {
        type: Array,
        required: true,
        default: () => [],
    },
    isFetching: {
        type: Boolean,
        default: false,
    },
    isFiltered: {
        type: Boolean,
        default: false,
    },
});

defineEmits(['view', 'reset-filter']);
</script>

<template>
    <div class="bg-bg-default border border-border-default rounded-default overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-border-default bg-neutral-100 text-body-md text-text-secondary uppercase tracking-wider">
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Attached Photo</th>
                        <th class="py-3.5 px-4 font-medium">Location</th>
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Tenant Name</th>
                        <th class="py-3.5 px-4 font-medium">Issues</th>
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Reported Date</th>
                        <th class="py-3.5 px-4 font-medium">Status</th>
                        <th class="py-3.5 px-4 font-medium text-center">Actions</th>
                    </tr>
                </thead>

                <tbody v-if="isFetching && issues.length === 0" class="animate-pulse">
                    <tr v-for="i in 5" :key="'admin-complaint-skeleton-' + i" class="border-b border-border-default last:border-none">
                        <td class="py-4 px-4 align-middle">
                            <div class="w-37.5 h-25 bg-neutral-200 rounded-default shrink-0"></div>
                        </td>
                        <td class="py-4 px-4 align-middle max-w-44">
                            <div class="h-5 my-0.5 w-28 max-w-full bg-neutral-200 rounded-md"></div>
                        </td>
                        <td class="py-4 px-4 align-middle whitespace-nowrap">
                            <div class="h-5 my-0.5 w-32 bg-neutral-200 rounded-md"></div>
                        </td>
                        <td class="py-4 px-4 align-middle max-w-52">
                            <div class="h-5 my-0.5 w-44 max-w-full bg-neutral-200 rounded-md"></div>
                        </td>
                        <td class="py-4 px-4 align-middle whitespace-nowrap">
                            <div class="h-5 my-0.5 w-28 bg-neutral-200 rounded-md"></div>
                        </td>
                        <td class="py-4 px-4 align-middle whitespace-nowrap">
                            <div class="h-8 w-20 bg-neutral-200 rounded-xl"></div>
                        </td>
                        <td class="py-4 px-4 align-middle text-center whitespace-nowrap">
                            <div class="w-9 h-9 bg-neutral-200 rounded-default inline-block"></div>
                        </td>
                    </tr>
                </tbody>

                <tbody v-else-if="issues.length === 0">
                    <tr>
                        <td colspan="7" class="py-16 sm:py-20 px-6 sm:px-10 text-center">
                            <div class="flex flex-col items-center justify-center text-center gap-6">
                                <svg class="w-28 h-28 shrink-0 text-text-secondary" viewBox="0 0 108 108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path
                                        d="M39.6 89.9997V71.5497L48.15 72.4497C50.6391 72.3114 52.9947 71.2794 54.7837 69.5432C56.5728 67.8071 57.6751 65.4836 57.888 62.9997V37.3497C57.9178 30.8668 55.3711 24.6375 50.8081 20.0323C46.245 15.427 40.0395 12.8231 33.5565 12.7932C27.0735 12.7634 20.8443 15.3101 16.239 19.8732C11.6338 24.4362 9.02984 30.6418 9 37.1247C9 49.7247 11.952 50.8677 13.5 57.5997C14.5408 61.6661 14.5856 65.9234 13.6305 70.0107L9 89.9997M89.1 80.0997C95.4262 73.7728 98.9813 65.1929 98.9838 56.2458C98.9863 47.2987 95.4361 38.7167 89.1135 32.3862M76.5 67.4997C77.9723 66.0277 79.1381 64.2785 79.9301 62.3531C80.7221 60.4277 81.1245 58.3644 81.114 56.2825C81.1035 54.2006 80.6804 52.1415 79.8692 50.2241C79.0579 48.3068 77.8745 46.5693 76.3875 45.1122"
                                        stroke-width="6"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke="currentColor"
                                    />
                                </svg>

                                <div class="flex flex-col items-center gap-8 sm:gap-10 max-w-2xl">
                                    <p class="text-h3 text-text-secondary">
                                        {{
                                            isFiltered
                                                ? 'There are no reported issues under this status filter. Try switching to another status.'
                                                : 'No reported issues have been submitted yet. Tenant reports will appear here once created.'
                                        }}
                                    </p>

                                    <BaseButton v-if="isFiltered" variant="secondary" size="md" @click="$emit('reset-filter')"> Show All Reports </BaseButton>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tbody>

                <tbody v-else class="transition-opacity duration-150" :class="isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'">
                    <AdminComplaintTableRow v-for="issue in issues" :key="issue.id" :issue="issue" @view="$emit('view', issue)" />
                </tbody>
            </table>
        </div>
    </div>
</template>
