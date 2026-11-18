<script setup>
import { watch, onUnmounted } from 'vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    maxWidth: {
        type: String,
        default: 'max-w-md',
    },
    persistent: {
        type: Boolean,
        default: false,
    },
    hideCloseButton: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const handleKeydown = event => {
    if (event.key === 'Escape' && props.isOpen && !props.persistent) {
        emit('close');
    }
};

const handleBackdropClick = () => {
    if (!props.persistent) {
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
        <transition
            enter-active-class="transition-opacity duration-300 ease-out"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
        >
            <div v-if="isOpen" class="fixed inset-0 z-100 flex items-center justify-center bg-neutral-900/50 backdrop-blur-[2px] p-4 sm:p-6" @click.self="handleBackdropClick">
                <transition
                    appear
                    enter-active-class="transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    enter-from-class="opacity-0 translate-y-8 scale-95"
                    enter-to-class="opacity-100 translate-y-0 scale-100"
                    leave-active-class="transition-all duration-200 ease-in"
                    leave-from-class="opacity-100 translate-y-4 scale-[0.98]"
                    leave-to-class="opacity-0 translate-y-8 scale-95"
                >
                    <div v-if="isOpen" role="dialog" aria-modal="true" :class="['bg-bg-default rounded-default w-full shadow-default relative flex flex-col max-h-[90vh] overflow-hidden', maxWidth]">
                        <button
                            v-if="!hideCloseButton"
                            @click="$emit('close')"
                            aria-label="Close modal"
                            class="absolute top-5 right-5 z-20 flex items-center justify-center w-8 h-8 bg-neutral-100 hover:bg-neutral-200 text-text-secondary hover:text-text-primary rounded-full transition-colors cursor-pointer focus:outline-none"
                        >
                            <svg class="w-3 h-3" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M0.613281 0.588867L12.6133 13.0889" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                                <path d="M12.6133 0.588867L0.613281 13.0889" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" />
                            </svg>
                        </button>

                        <slot />
                    </div>
                </transition>
            </div>
        </transition>
    </Teleport>
</template>
