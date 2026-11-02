<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
});
</script>

<template>
    <section class="flex flex-col gap-4 w-full shrink-0">
        <h3 class="text-h5 font-semibold text-text-secondary">{{ title }}</h3>
        <div class="w-full bg-surface-default rounded-default px-3 py-4 flex flex-col gap-4 text-left">
            <slot></slot>
        </div>
    </section>
</template>
