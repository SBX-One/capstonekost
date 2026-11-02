<script setup>
defineProps({
    label: {
        type: String,
        required: true,
    },
    value: {
        type: [String, Number],
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
});

defineEmits(['click-action']);
</script>

<template>
    <div class="bg-neutral-900 rounded-default px-8 py-6 flex items-end justify-between transition-transform hover:-translate-y-1 hover:shadow-default cursor-pointer group" @click="$emit('click-action')">
        <div class="flex flex-col gap-2 text-text-inverse">
            <span class="text-body-sm uppercase tracking-wider text-neutral-400">
                {{ label }}
            </span>

            <span class="text-h2 font-semibold">
                {{ value }}
            </span>

            <span class="text-body-md text-neutral-400">
                {{ description }}
            </span>
        </div>

        <button class="w-10 h-10 rounded-full bg-neutral-50 text-neutral-900 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" aria-label="View Details">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
    </div>
</template>
