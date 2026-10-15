<script setup>
import { watch, onUnmounted } from 'vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const emit = defineEmits(['close']);

const handleKeydown = event => {
    if (event.key === 'Escape' && props.isOpen) {
        emit('close');
    }
};

const toggleBodyScroll = lock => {
    if (lock) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
};

watch(
    () => props.isOpen,
    isOpen => {
        if (isOpen) {
            toggleBodyScroll(true);
            window.addEventListener('keydown', handleKeydown);
        } else {
            toggleBodyScroll(false);
            window.removeEventListener('keydown', handleKeydown);
        }
    },
    { immediate: true }
);

onUnmounted(() => {
    toggleBodyScroll(false);
    window.removeEventListener('keydown', handleKeydown);
});
</script>

<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs select-none" @click.self="$emit('close')">
                <div class="modal-container bg-bg-default rounded-default shadow-xl w-full max-w-md p-6 relative" role="dialog" aria-modal="true">
                    <button type="button" @click="$emit('close')" class="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer p-1" aria-label="Close Modal">
                        <svg class="w-5 h-5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.613281 0.588867L12.6133 13.0889" stroke="currentColor" stroke-width="1.7" />
                            <path d="M12.6133 0.588867L0.613281 13.0889" stroke="currentColor" stroke-width="1.7" />
                        </svg>
                    </button>

                    <slot />
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
    opacity: 0;
    transform: scale(0.95) translateY(8px);
}
</style>
