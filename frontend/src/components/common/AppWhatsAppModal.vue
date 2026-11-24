<script setup>
import { computed } from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { buildWhatsAppUrl } from '@/utils/formatters';

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    phone: {
        type: String,
        default: '',
    },
    message: {
        type: String,
        default: '',
    },
    title: {
        type: String,
        default: 'Contact The Tenant',
    },
    description: {
        type: String,
        default: 'Have questions about this report? Chat with the tenant via WhatsApp.',
    },
    confirmText: {
        type: String,
        default: 'Continue to WhatsApp',
    },
    cancelText: {
        type: String,
        default: 'Cancel',
    },
    closeOnConfirm: {
        type: Boolean,
        default: true,
    },
});

const emit = defineEmits(['close', 'confirm']);

const whatsAppUrl = computed(() => buildWhatsAppUrl(props.phone, props.message));
const isPhoneAvailable = computed(() => Boolean(whatsAppUrl.value));

function handleContinue() {
    if (!isPhoneAvailable.value) return;

    window.open(whatsAppUrl.value, '_blank', 'noopener,noreferrer');
    emit('confirm', whatsAppUrl.value);

    if (props.closeOnConfirm) {
        emit('close');
    }
}
</script>

<template>
    <AppModal :is-open="isOpen" @close="$emit('close')">
        <section aria-labelledby="whatsapp-modal-title" aria-describedby="whatsapp-modal-description" class="p-6 pt-12 flex flex-col items-center gap-6">
            <div class="inline-flex items-center justify-center p-3 rounded-default bg-green-50 shrink-0">
                <svg class="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path
                        d="M32.9003 8.08235C29.6106 4.80646 25.2353 3.00164 20.5735 3C10.9675 3 3.14953 10.7739 3.14622 20.3293C3.14457 23.384 3.94753 26.3656 5.47256 28.9932L3 37.9745L12.2384 35.5646C14.7836 36.9457 17.6497 37.6728 20.566 37.6737H20.5735C30.1779 37.6737 37.9967 29.8989 38 20.3435C38.0017 15.7124 36.1909 11.3589 32.9003 8.08312V8.08235ZM20.5735 34.7469H20.5677C17.9689 34.7462 15.4196 34.0514 13.1952 32.7393L12.6663 32.4269L7.18386 33.8569L8.64706 28.5411L8.30269 27.996C6.85292 25.7025 6.08671 23.0516 6.08836 20.3302C6.09176 12.3885 12.5893 5.92675 20.5794 5.92675C24.4482 5.9284 28.0848 7.42827 30.8197 10.1514C33.5546 12.8738 35.0595 16.4936 35.0579 20.3418C35.0545 28.2844 28.5569 34.7462 20.5735 34.7462V34.7469ZM28.5184 23.9591C28.083 23.7422 25.9423 22.6951 25.5428 22.5506C25.1434 22.406 24.8535 22.3337 24.5635 22.7675C24.2736 23.2013 23.4388 24.1768 23.1848 24.4652C22.9308 24.7543 22.6767 24.7901 22.2413 24.5731C21.8061 24.3563 20.4031 23.8993 18.7394 22.4242C17.4451 21.2758 16.571 19.8582 16.317 19.4244C16.063 18.9906 16.2903 18.7563 16.5075 18.5411C16.703 18.3466 16.9428 18.035 17.1609 17.7824C17.379 17.5297 17.4509 17.3486 17.5963 17.0602C17.7417 16.771 17.669 16.5185 17.5604 16.3015C17.4517 16.0847 16.5811 13.9532 16.2176 13.0865C15.8641 12.2422 15.5048 12.3569 15.2382 12.3428C14.9842 12.3302 14.6943 12.3278 14.4035 12.3278C14.1127 12.3278 13.6414 12.4359 13.242 12.8696C12.8426 13.3033 11.7178 14.3512 11.7178 16.4819C11.7178 18.6125 13.2779 20.6726 13.496 20.9618C13.7141 21.251 16.5668 25.6244 20.9345 27.5008C21.9732 27.947 22.7845 28.2137 23.4171 28.4132C24.46 28.7431 25.4091 28.6966 26.1595 28.5852C26.996 28.4606 28.7357 27.5373 29.0983 26.526C29.461 25.5147 29.461 24.6471 29.3524 24.4668C29.2438 24.2865 28.953 24.1776 28.5176 23.9607L28.5184 23.9591Z"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        fill="#25D366"
                    />
                </svg>
            </div>

            <div class="flex flex-col items-center text-center gap-2 w-full">
                <h3 id="whatsapp-modal-title" class="text-h3 text-text-primary wrap-break-word w-full">
                    {{ title }}
                </h3>
                <p id="whatsapp-modal-description" class="text-body-md text-text-secondary wrap-break-word w-full">
                    {{ description }}
                </p>
                <p v-if="!isPhoneAvailable" role="status" class="text-body-sm text-status-error mt-1">Recipient phone number is unavailable.</p>
            </div>

            <div class="flex flex-col gap-3 w-full">
                <BaseButton variant="primary" size="sm" :block="true" :disabled="!isPhoneAvailable" @click="handleContinue">
                    <template #icon-left>
                        <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path
                                d="M10 5H8.2C7.08 5 6.52 5 6.092 5.218C5.71569 5.40974 5.40974 5.71569 5.218 6.092C5 6.52 5 7.08 5 8.2V15.8C5 16.92 5 17.48 5.218 17.908C5.40974 18.2843 5.71569 18.5903 6.092 18.782C6.519 19 7.079 19 8.197 19H15.803C16.921 19 17.48 19 17.907 18.782C18.284 18.59 18.59 18.284 18.782 17.908C19 17.48 19 16.921 19 15.803V14M15 4H20V9M20 4L13 11"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke="currentColor"
                            />
                        </svg>
                    </template>
                    {{ confirmText }}
                </BaseButton>

                <BaseButton variant="secondary" size="sm" :block="true" @click="$emit('close')">
                    {{ cancelText }}
                </BaseButton>
            </div>
        </section>
    </AppModal>
</template>
