<script setup>
import AppDropdown from '@/components/common/AppDropdown.vue';
import RoomStatusBadge from '@/components/common/RoomStatusBadge.vue';

defineProps({
    statusOptions: {
        type: Array,
        default: () => [],
    },
});

const search = defineModel('search', { type: String, default: '' });
const status = defineModel('status', { type: String, default: '' });
</script>

<template>
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div class="relative w-full sm:max-w-md">
            <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M18 10C18 5.59 14.41 2 10 2C5.59 2 2 5.59 2 10C2 14.41 5.59 18 10 18C11.85 18 13.54 17.37 14.9 16.31L20 21.41L21.41 20L16.31 14.9C17.4015 13.4995 17.9961 11.7756 18 10ZM4 10C4 6.69 6.69 4 10 4C13.31 4 16 6.69 16 10C16 13.31 13.31 16 10 16C6.69 16 4 13.31 4 10Z"
                        fill="currentColor"
                    />
                </svg>
            </span>
            <input
                v-model="search"
                type="text"
                placeholder="Search room..."
                class="w-full pl-10 pr-4 py-2.5 bg-bg-default border border-border-default rounded-default text-body-md focus:outline-none focus:border-border-focus transition-colors"
            />
        </div>

        <div class="w-full sm:w-48 shrink-0">
            <AppDropdown id="statusFilter" v-model="status" :options="statusOptions" placeholder="All Statuses">
                <template #selected="{ selectedLabel, modelValue }">
                    <span v-if="!modelValue">{{ selectedLabel }}</span>
                    <RoomStatusBadge v-else :status="modelValue" />
                </template>

                <template #option="{ option }">
                    <RoomStatusBadge :status="option.value" />
                </template>
            </AppDropdown>
        </div>
    </div>
</template>
