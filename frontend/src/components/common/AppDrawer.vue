<script setup>
import { ref, watch, nextTick, onUnmounted, useId } from 'vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    maxWidth: {
        type: String,
        default: 'md:max-w-lg',
    },
    persistent: {
        type: Boolean,
        default: false,
    },
    hideCloseButton: {
        type: Boolean,
        default: false,
    },
    headerClass: {
        type: String,
        default: 'px-6 sm:px-10 pt-8 sm:pt-10 pb-6',
    },
    bodyClass: {
        type: String,
        default: 'px-6 sm:px-10 py-8 sm:py-10 flex flex-col gap-8 sm:gap-10',
    },
    footerClass: {
        type: String,
        default: 'px-6 sm:px-10 py-6 sm:py-8 flex flex-col gap-3',
    },
});

const emit = defineEmits(['close']);
const titleId = `drawer-title-${useId()}`;
const dialogPanelRef = ref(null);

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
        const hasOtherOpenDialog = document.querySelectorAll('[role="dialog"]').length > 0;
        if (!hasOtherOpenDialog) {
            document.body.style.overflow = '';
        }
    }
};

watch(
    () => props.isOpen,
    async isOpen => {
        if (isOpen) {
            toggleBodyScroll(true);
            window.addEventListener('keydown', handleKeydown);
            await nextTick();
            dialogPanelRef.value?.focus({ preventScroll: true });
        } else {
            window.removeEventListener('keydown', handleKeydown);
            await nextTick();
            toggleBodyScroll(false);
        }
    },
    { immediate: true }
);

onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown);
    document.body.style.overflow = '';
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
            <div v-if="isOpen" class="fixed inset-0 z-100 bg-neutral-900/50 backdrop-blur-[2px] flex justify-end" @click.self="handleBackdropClick">
                <transition
                    appear
                    enter-active-class="transition-transform duration-300 ease-out"
                    enter-from-class="translate-x-full"
                    enter-to-class="translate-x-0"
                    leave-active-class="transition-transform duration-200 ease-in"
                    leave-from-class="translate-x-0"
                    leave-to-class="translate-x-full"
                >
                    <div
                        v-if="isOpen"
                        ref="dialogPanelRef"
                        tabindex="-1"
                        role="dialog"
                        aria-modal="true"
                        :aria-labelledby="title || $slots.header ? titleId : undefined"
                        :class="['w-full bg-bg-default h-full flex flex-col relative focus:outline-none', maxWidth]"
                    >
                        <header v-if="title || !hideCloseButton || $slots.header" :class="['flex items-center justify-between shrink-0 z-10', headerClass]">
                            <slot name="header" :title-id="titleId">
                                <h2 :id="titleId" class="text-h2 text-text-primary">{{ title }}</h2>
                            </slot>

                            <button
                                v-if="!hideCloseButton"
                                type="button"
                                @click="handleBackdropClick"
                                class="p-2 -mr-2 text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none cursor-pointer"
                                aria-label="Close drawer"
                            >
                                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </header>

                        <div :class="['flex-1 overflow-y-auto custom-scrollbar', bodyClass]">
                            <slot />
                        </div>

                        <footer v-if="$slots.footer" :class="['shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] z-10 bg-bg-default', footerClass]">
                            <slot name="footer" />
                        </footer>
                    </div>
                </transition>
            </div>
        </transition>
    </Teleport>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-neutral-300, #dcdce2);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--color-neutral-500, #9b9ba6);
}
</style>
