<script setup>
import { computed } from 'vue';

const modelValue = defineModel({
    type: [String, Number],
    default: '',
});

const props = defineProps({
    id: {
        type: String,
        default: () => `input-${Math.random().toString(36).substring(2, 9)}`,
    },
    type: {
        type: String,
        default: 'text',
    },
    variant: {
        type: String,
        default: 'primary',
        validator: val => ['primary', 'secondary'].includes(val),
    },
    size: {
        type: String,
        default: 'default',
        validator: val => ['default', 'large'].includes(val),
    },
    label: {
        type: String,
        default: '',
    },
    showText: {
        type: Boolean,
        default: true,
    },
    placeholder: {
        type: String,
        default: '',
    },
    error: {
        type: String,
        default: '',
    },
    hint: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    required: {
        type: Boolean,
        default: false,
    },
    showIconRight: {
        type: Boolean,
        default: false,
    },
    rows: {
        type: Number,
        default: 4,
    },
});

const isTextarea = computed(() => props.type === 'textarea' || props.size === 'large');

const sizeClasses = computed(() => {
    if (isTextarea.value) {
        return 'px-300 py-300 min-h-[120px]';
    }
    return 'px-300 py-200';
});

const variantClasses = computed(() => {
    if (props.disabled) {
        return 'bg-surface-default border-transparent text-text-disabled cursor-not-allowed';
    }

    if (props.error) {
        return 'bg-surface-default border-status-error text-text-primary focus:border-status-error';
    }

    if (props.variant === 'secondary') {
        return 'bg-transparent border-border-default focus:border-border-focus text-text-primary';
    }

    return 'bg-surface-default border-transparent focus:border-border-focus text-text-primary';
});
</script>

<template>
    <div class="flex flex-col gap-200 w-full">
        <div v-if="showText && (label || $slots['label-action'])" class="flex items-center justify-between">
            <label v-if="label" :for="id" class="text-body-lg text-text-primary flex items-center gap-50">
                {{ label }}
                <span v-if="required" class="text-status-error">*</span>
            </label>

            <div v-if="$slots['label-action']" class="text-label-btn-md text-text-secondary">
                <slot name="label-action" />
            </div>
        </div>

        <div class="relative w-full flex items-center">
            <textarea
                v-if="isTextarea"
                :id="id"
                v-model="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                :rows="rows"
                class="w-full text-body-md rounded-default border transition-colors duration-200 focus:outline-none resize-y"
                :class="[sizeClasses, variantClasses, { 'pr-1000': showIconRight || $slots['icon-right'] }]"
            ></textarea>

            <input
                v-else
                :id="id"
                v-model="modelValue"
                :type="type"
                :placeholder="placeholder"
                :disabled="disabled"
                :required="required"
                class="w-full text-body-md rounded-default border transition-colors duration-200 focus:outline-none"
                :class="[sizeClasses, variantClasses, { 'pr-1000': showIconRight || $slots['icon-right'] }]"
            />

            <div v-if="showIconRight || $slots['icon-right']" class="absolute right-300 top-300 flex items-center justify-center text-text-secondary">
                <slot name="icon-right" />
            </div>
        </div>

        <p v-if="error" class="text-body-sm text-status-error">
            {{ error }}
        </p>
        <p v-else-if="hint" class="text-body-sm text-text-secondary">
            {{ hint }}
        </p>
    </div>
</template>
