<script setup>
import AppModal from '@/components/common/AppModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    title: {
        type: String,
        default: 'Sign in to continue',
    },
    message: {
        type: String,
        default: 'Sign in to your account to continue booking this room',
    },
    buttonText: {
        type: String,
        default: 'Sign In',
    },
});

defineEmits(['close', 'submit']);
</script>

<template>
    <AppModal :is-open="isOpen" @close="$emit('close')">
        <div class="text-center flex flex-col items-center pt-2">
            <h3 class="text-h3 font-bold text-text-primary mb-2 wrap-break-word w-full">{{ title }}</h3>
            <div class="max-h-32 overflow-y-auto w-full px-2 mb-8 custom-scrollbar">
                <p class="text-body-md text-text-secondary wrap-break-word">{{ message }}</p>
            </div>

            <BaseButton variant="primary" size="sm" :block="true" class="mb-4" @click="$emit('submit')">
                {{ buttonText }}
            </BaseButton>

            <div v-if="$slots.footer" class="text-body-sm text-text-secondary">
                <slot name="footer" />
            </div>
        </div>
    </AppModal>
</template>
