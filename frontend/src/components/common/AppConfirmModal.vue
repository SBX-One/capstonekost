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
        default: 'Delete Room?',
    },
    message: {
        type: String,
        default: 'Are you sure you want to delete this room?',
    },
    confirmText: {
        type: String,
        default: 'Delete Room',
    },
    cancelText: {
        type: String,
        default: 'Cancel',
    },
});

defineEmits(['close', 'confirm']);
</script>

<template>
    <AppModal :is-open="isOpen" @close="$emit('close')">
        <div class="text-center flex flex-col items-center pt-2">
            <div class="w-15 h-15 rounded-default bg-red-50 text-action-destructive flex items-center justify-center mb-4 shrink-0">
                <slot name="icon">
                    <svg class="w-7 h-7" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M20 4.5835C18.3691 4.5835 16.9785 5.62521 16.4631 7.08338C16.233 7.73428 15.5189 8.07545 14.868 7.84538C14.2171 7.61531 13.8759 6.90116 14.106 6.25028C14.9634 3.82448 17.2768 2.0835 20 2.0835C22.7233 2.0835 25.0366 3.82448 25.8941 6.25028C26.1241 6.90116 25.783 7.61531 25.1321 7.84538C24.4811 8.07545 23.767 7.73428 23.537 7.08338C23.0216 5.62521 21.6308 4.5835 20 4.5835Z"
                            fill="currentColor"
                        />
                        <path
                            d="M4.58301 10C4.58301 9.30965 5.14266 8.75 5.83301 8.75H34.1665C34.8568 8.75 35.4165 9.30965 35.4165 10C35.4165 10.6903 34.8568 11.25 34.1665 11.25H5.83301C5.14266 11.25 4.58301 10.6903 4.58301 10Z"
                            fill="currentColor"
                        />
                        <path
                            d="M9.8586 14.0839C9.81268 13.3951 9.21705 12.8739 8.52823 12.9198C7.8394 12.9657 7.31821 13.5614 7.36415 14.2502L8.13656 25.8364C8.27905 27.9744 8.39415 29.7012 8.6641 31.0564C8.94476 32.4652 9.42213 33.642 10.4081 34.5644C11.3941 35.4869 12.6 35.8849 14.0244 36.0712C15.3945 36.2504 17.1253 36.2504 19.268 36.2504H20.7326C22.8753 36.2504 24.606 36.2504 25.9761 36.0712C27.4005 35.8849 28.6065 35.4869 29.5925 34.5644C30.5785 33.642 31.0558 32.4652 31.3365 31.0564C31.6063 29.7012 31.7215 27.9744 31.864 25.8364L32.6365 14.2502C32.6823 13.5614 32.1611 12.9657 31.4723 12.9198C30.7835 12.8739 30.1878 13.3951 30.142 14.0839L29.3753 25.5824C29.2256 27.8289 29.1188 29.3919 28.8846 30.5679C28.6573 31.7087 28.3401 32.3125 27.8845 32.7389C27.4288 33.165 26.8051 33.4415 25.6518 33.5924C24.4628 33.7479 22.8961 33.7504 20.6448 33.7504H19.3558C17.1045 33.7504 15.5377 33.7479 14.3487 33.5924C13.1954 33.4415 12.5718 33.165 12.1161 32.7389C11.6604 32.3125 11.3432 31.7087 11.1159 30.5679C10.8816 29.3919 10.7749 27.8289 10.6252 25.5824L9.8586 14.0839Z"
                            fill="currentColor"
                        />
                        <path
                            d="M15.7087 17.0898C16.3957 17.0211 17.0081 17.5223 17.077 18.2093L17.9103 26.5426C17.979 27.2295 17.4778 27.8421 16.7908 27.9108C16.1039 27.9795 15.4913 27.4783 15.4226 26.7913L14.5893 18.458C14.5206 17.7711 15.0218 17.1585 15.7087 17.0898Z"
                            fill="currentColor"
                        />
                        <path
                            d="M25.4103 18.458C25.479 17.7711 24.9778 17.1585 24.2908 17.0898C23.604 17.0211 22.9913 17.5223 22.9226 18.2093L22.0893 26.5426C22.0206 27.2295 22.5218 27.8421 23.2088 27.9108C23.8956 27.9795 24.5081 27.4783 24.577 26.7913L25.4103 18.458Z"
                            fill="currentColor"
                        />
                    </svg>
                </slot>
            </div>

            <h3 class="text-h3 font-bold text-text-primary mb-2 wrap-break-word w-full">{{ title }}</h3>
            <div class="max-h-32 overflow-y-auto w-full px-2 mb-8 custom-scrollbar">
                <p class="text-body-md text-text-secondary wrap-break-word">{{ message }}</p>
            </div>

            <div class="flex items-center gap-4 w-full">
                <BaseButton variant="secondary" size="sm" :block="true" @click="$emit('close')">
                    {{ cancelText }}
                </BaseButton>

                <BaseButton variant="destructive" size="sm" :block="true" @click="$emit('confirm')">
                    {{ confirmText }}
                </BaseButton>
            </div>
        </div>
    </AppModal>
</template>
