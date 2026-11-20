<script setup>
import { computed } from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { formatPaymentPlan } from '@/utils/formatters';

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    plan: {
        type: String,
        default: 'monthly',
    },
    formattedAmount: {
        type: String,
        required: true,
    },
    durationLabel: {
        type: String,
        required: true,
    },
    isSubmitting: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close', 'confirm']);

const isMonthly = computed(() => String(props.plan).toLowerCase() === 'monthly');
const selectedPlanLabel = computed(() => formatPaymentPlan(props.plan));
const amountLabel = computed(() => (isMonthly.value ? 'Monthly Amount' : 'Total Amount'));
const frequencyLabel = computed(() => (isMonthly.value ? 'Every month' : 'One-time payment'));

function handleClose() {
    if (!props.isSubmitting) {
        emit('close');
    }
}
</script>

<template>
    <AppModal :is-open="isOpen" maxWidth="max-w-xl" :persistent="isSubmitting" :hide-close-button="isSubmitting" @close="handleClose">
        <div class="p-6 sm:p-8 pt-10 sm:pt-12 flex flex-col gap-6">
            <header class="flex flex-col gap-1">
                <h2 class="text-h3 text-text-primary tracking-tight">Confirm Payment Plan</h2>
                <p class="text-body-md text-text-secondary">Review your selected plan before continuing</p>
            </header>

            <section aria-labelledby="confirm-booking-details-heading" class="flex flex-col gap-3">
                <h3 id="confirm-booking-details-heading" class="text-h4 text-text-primary">Booking Details</h3>

                <dl class="bg-neutral-100 rounded-default px-4 py-6 flex flex-col gap-4 m-0">
                    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <dt class="text-body-md text-text-secondary">Selected Plan</dt>
                        <dd class="text-label-btn-md text-text-primary text-right m-0">
                            {{ selectedPlanLabel }}
                        </dd>
                    </div>

                    <hr class="border-t border-border-default m-0" />

                    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <dt class="text-body-md text-text-secondary">{{ amountLabel }}</dt>
                        <dd class="text-label-btn-md text-text-primary text-right m-0">
                            {{ formattedAmount }}
                        </dd>
                    </div>

                    <hr class="border-t border-border-default m-0" />

                    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <dt class="text-body-md text-text-secondary">Payment Frequency</dt>
                        <dd class="text-label-btn-md text-text-primary text-right m-0">
                            {{ frequencyLabel }}
                        </dd>
                    </div>

                    <hr class="border-t border-border-default m-0" />

                    <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                        <dt class="text-body-md text-text-secondary">Rental Duration</dt>
                        <dd class="text-label-btn-md text-text-primary text-right m-0">
                            {{ durationLabel }}
                        </dd>
                    </div>
                </dl>
            </section>

            <p class="text-label-badge text-text-secondary">
                The initial payment must be recorded by the admin within 24 hours after booking approval. Payment is made directly to the admin, not through this application.
            </p>

            <footer class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseButton variant="secondary" size="md" block :disabled="isSubmitting" @click="handleClose"> Cancel </BaseButton>
                <BaseButton variant="primary" size="md" block :disabled="isSubmitting" aria-label="Confirm Plan" @click="$emit('confirm')">
                    <svg v-if="isSubmitting" class="animate-spin h-5 w-5 text-text-inverse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span v-else>Confirm Plan</span>
                </BaseButton>
            </footer>
        </div>
    </AppModal>
</template>
