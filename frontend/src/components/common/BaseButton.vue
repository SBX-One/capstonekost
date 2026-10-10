<script setup>
import { computed } from 'vue';

const props = defineProps({
    variant: {
        type: String,
        default: 'primary',
        validator: val => ['primary', 'secondary', 'destructive', 'ghost', 'disabled'].includes(val),
    },
    size: {
        type: String,
        default: 'md',
        validator: val => ['sm', 'md', 'lg'].includes(val),
    },
    type: {
        type: String,
        default: 'button',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    block: {
        type: Boolean,
        default: false,
    },
});

const sizeClasses = computed(() => {
    switch (props.size) {
        case 'sm':
            return 'p-200 text-body-sm';
        case 'lg':
            return 'px-500 py-300 text-label-btn-lg';
        case 'md':
        default:
            return 'px-400 py-200 text-label-btn-md';
    }
});

const variantClasses = computed(() => {
    if (props.disabled || props.variant === 'disabled') {
        return 'bg-action-disabled text-text-disabled cursor-not-allowed border-transparent';
    }

    switch (props.variant) {
        case 'secondary':
            return 'bg-transparent hover:bg-action-secondary-hover active:bg-action-secondary-pressed text-text-primary border border-border-default';
        case 'destructive':
            return 'bg-action-destructive hover:bg-action-destructive-hover active:bg-action-destructive-pressed text-text-inverse border-transparent';
        case 'ghost':
            return 'bg-transparent hover:text-neutral-700 active:text-text-primary text-text-secondary border-transparent';
        case 'primary':
        default:
            return 'bg-action-primary hover:bg-action-primary-hover active:bg-action-primary-pressed text-text-inverse border-transparent';
    }
});
</script>

<template>
    <button
        :type="type"
        :disabled="disabled || variant === 'disabled'"
        class="inline-flex items-center justify-center gap-200 rounded-default font-semibold transition-colors duration-200 focus:outline-none"
        :class="[sizeClasses, variantClasses, block ? 'w-full' : 'w-fit', disabled || variant === 'disabled' ? 'cursor-not-allowed' : 'cursor-pointer']"
    >
        <slot name="icon-left" />

        <slot>Button</slot>

        <slot name="icon-right" />
    </button>
</template>
