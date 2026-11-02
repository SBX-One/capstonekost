<script setup>
defineProps({
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        default: '',
    },
});
</script>

<template>
    <section class="bg-surface-default rounded-default px-8 py-6 flex flex-col w-full h-full">
        <header class="flex items-start justify-between mb-6">
            <div class="flex flex-col">
                <h3 class="text-h4 text-text-primary">{{ title }}</h3>
                <p v-if="subtitle" class="text-body-md text-text-secondary">{{ subtitle }}</p>
            </div>

            <div v-if="$slots.action" class="shrink-0 ml-4">
                <slot name="action"></slot>
            </div>
        </header>

        <div class="flex-1 flex flex-col">
            <slot></slot>
        </div>

        <footer v-if="$slots.footer" class="pt-6 border-t border-border-default">
            <slot name="footer"></slot>
        </footer>
    </section>
</template>
