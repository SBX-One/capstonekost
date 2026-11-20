<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    amount: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        required: true,
    },
    selected: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['select']);

function handleSelect() {
    if (!props.disabled) {
        emit('select');
    }
}
</script>

<template>
    <div
        role="radio"
        :aria-checked="selected"
        :aria-disabled="disabled"
        :tabindex="disabled ? -1 : 0"
        @click="handleSelect"
        @keydown.enter.prevent="handleSelect"
        @keydown.space.prevent="handleSelect"
        class="w-full rounded-default px-6 sm:px-10 py-8 flex items-start justify-between gap-4 border transition-colors duration-150 select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus focus-visible:ring-offset-1"
        :class="[disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer', selected ? 'bg-neutral-100 border-border-focus' : 'bg-neutral-100 border-border-default hover:bg-neutral-300']"
    >
        <div class="flex flex-col gap-2 min-w-0">
            <h3 class="text-h4 text-text-primary tracking-tight">
                {{ title }}
            </h3>

            <p class="text-h2 text-text-primary tracking-tight wrap-break-word">
                {{ amount }}
            </p>

            <p class="text-h5 text-text-secondary">
                {{ subtitle }}
            </p>
        </div>

        <div class="flex items-center gap-2 shrink-0">
            <span class="text-label-btn-md text-text-secondary">
                {{ selected ? 'Selected' : 'Select Plan' }}
            </span>

            <span class="w-4 h-4 rounded-full flex items-center justify-center border transition-colors" :class="selected ? 'border-text-primary' : 'border-text-secondary'" aria-hidden="true">
                <span v-if="selected" class="w-2 h-2 rounded-full bg-text-primary"></span>
            </span>
        </div>
    </div>
</template>
