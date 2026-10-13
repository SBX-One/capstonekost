<script setup>
import AppIcon from '@/components/common/AppIcon.vue';

defineProps({
    label: {
        type: String,
        required: true,
    },
    to: {
        type: [String, Object],
        required: true,
    },
    iconName: {
        type: String,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isCollapsed: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div :class="{ 'tooltip tooltip-right w-full': isCollapsed }" :data-tip="isCollapsed ? label : ''">
        <router-link
            :to="to"
            class="flex items-center transition-all duration-200 text-h5 select-none w-full"
            :class="[
                isActive ? 'bg-action-primary text-text-inverse shadow-default' : 'text-neutral-500 hover:bg-neutral-400 hover:text-neutral-50',
                isCollapsed ? 'justify-center px-0 py-100 rounded-default' : 'justify-start gap-200 px-600 py-100 rounded-tr-default rounded-br-default',
            ]"
        >
            <AppIcon :name="iconName" :is-active="isActive" />
            <span v-if="!isCollapsed" class="flex-1 text-left truncate">{{ label }}</span>
        </router-link>
    </div>
</template>
