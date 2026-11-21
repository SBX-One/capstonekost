<script setup>
import AppModal from '@/components/common/AppModal.vue';
import PaymentStatusBadge from '@/components/common/PaymentStatusBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    payment: {
        type: Object,
        default: null,
    },
    isLoading: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(['close', 'retry']);

const handleClose = () => {
    emit('close');
};
</script>

<template>
    <AppModal :isOpen="isOpen" maxWidth="max-w-xl" @close="handleClose">
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 flex flex-col gap-6 sm:gap-8" aria-labelledby="payment-detail-modal-title" :aria-busy="isLoading && !payment">
            <header class="flex items-center justify-between pr-10 shrink-0">
                <h2 id="payment-detail-modal-title" class="text-h3 text-text-primary tracking-tight">Payment Details</h2>
            </header>

            <div v-if="isLoading && !payment" role="status" aria-label="Loading payment details" class="flex flex-col gap-6 sm:gap-8 animate-pulse">
                <div aria-hidden="true" class="flex flex-col gap-3 shrink-0">
                    <div class="h-7 w-48 bg-neutral-200 rounded-md"></div>

                    <div class="bg-surface-default rounded-default py-6 px-4 flex flex-col gap-4">
                        <div class="flex items-center justify-between gap-4">
                            <div class="h-6 w-40 bg-neutral-200 rounded-md"></div>
                            <div class="h-8 w-24 bg-neutral-200 rounded-xl shrink-0"></div>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <div class="h-6 w-24 bg-neutral-200 rounded-md"></div>
                            <div class="h-6 w-28 bg-neutral-200 rounded-md"></div>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <div class="h-6 w-24 bg-neutral-200 rounded-md"></div>
                            <div class="h-6 w-24 bg-neutral-200 rounded-md"></div>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <div class="h-6 w-20 bg-neutral-200 rounded-md"></div>
                            <div class="h-6 w-24 bg-neutral-200 rounded-md"></div>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <div class="h-6 w-32 bg-neutral-200 rounded-md"></div>
                            <div class="h-6 w-24 bg-neutral-200 rounded-md"></div>
                        </div>
                    </div>
                </div>

                <div aria-hidden="true" class="flex flex-col gap-3 shrink-0">
                    <div class="h-7 w-44 bg-neutral-200 rounded-md"></div>

                    <div class="bg-surface-default rounded-default py-6 px-4 flex flex-col gap-4">
                        <div class="flex items-center justify-between gap-4">
                            <div class="h-6 w-14 bg-neutral-200 rounded-md"></div>
                            <div class="h-6 w-36 bg-neutral-200 rounded-md"></div>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <div class="h-6 w-24 bg-neutral-200 rounded-md"></div>
                            <div class="h-6 w-40 bg-neutral-200 rounded-md"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="error && !payment" role="alert" class="p-6 rounded-default bg-status-error-bg border border-status-error flex flex-col items-center text-center gap-4">
                <p class="text-body-md text-status-error">{{ error }}</p>
                <BaseButton variant="secondary" size="sm" @click="emit('retry')"> Try Again </BaseButton>
            </div>

            <template v-else-if="payment">
                <div v-if="payment.isOverdue" role="status" aria-live="polite" class="flex flex-col gap-2">
                    <p class="text-h3 text-status-error tracking-tight">
                        {{ payment.gracePeriodTitle }}
                    </p>
                    <p class="text-body-sm text-text-secondary">
                        {{ payment.gracePeriodDescription }}
                    </p>
                </div>

                <section aria-labelledby="payment-info-heading" class="flex flex-col gap-3">
                    <h3 id="payment-info-heading" class="text-h4 text-text-primary">Payment Information</h3>

                    <dl class="bg-surface-default rounded-default py-6 px-4 flex flex-col gap-4 m-0">
                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-body-md text-text-secondary">Current Payment Status</dt>
                            <dd class="m-0">
                                <PaymentStatusBadge :status="payment.statusKey" :label="payment.statusLabel" />
                            </dd>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-body-md text-text-secondary">Payment Plan</dt>
                            <dd class="m-0 text-label-btn-md text-text-primary text-right">
                                {{ payment.paymentPlanLabel }}
                            </dd>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-body-md text-text-secondary">Total Amount</dt>
                            <dd class="m-0 text-label-btn-md text-text-primary text-right">
                                {{ payment.formattedTotalAmount }}
                            </dd>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-body-md text-text-secondary">Total Paid</dt>
                            <dd class="m-0 text-label-btn-md text-text-primary text-right">
                                {{ payment.formattedTotalPaid }}
                            </dd>
                        </div>

                        <div v-if="!payment.isCancelled" class="flex items-center justify-between gap-4">
                            <dt class="text-body-md text-text-secondary">Remaining Balance</dt>
                            <dd class="m-0 text-label-btn-md text-text-primary text-right">
                                {{ payment.formattedRemainingBalance }}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section v-if="payment.isCancelled" aria-labelledby="cancellation-info-heading" class="flex flex-col gap-3">
                    <h3 id="cancellation-info-heading" class="text-h4 text-text-primary">Cancellation Information</h3>

                    <dl class="bg-surface-default rounded-default py-6 px-4 flex flex-col gap-4 m-0">
                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-body-md text-text-secondary">Cancellation Reason</dt>
                            <dd class="m-0 text-label-btn-md text-text-primary text-right">
                                {{ payment.cancellationReason }}
                            </dd>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-body-md text-text-secondary">Cancellation Date</dt>
                            <dd class="m-0 text-label-btn-md text-text-primary text-right">
                                {{ payment.cancellationDateLabel }}
                            </dd>
                        </div>
                    </dl>
                </section>

                <section aria-labelledby="booking-info-heading" class="flex flex-col gap-3">
                    <h3 id="booking-info-heading" class="text-h4 text-text-primary">Booking Information</h3>

                    <dl class="bg-surface-default rounded-default py-6 px-4 flex flex-col gap-4 m-0">
                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-body-md text-text-secondary">Room</dt>
                            <dd class="m-0 text-label-btn-md text-text-primary text-right">
                                {{ payment.roomLabel }}
                            </dd>
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <dt class="text-body-md text-text-secondary">Rental Period</dt>
                            <dd class="m-0 text-label-btn-md text-text-primary text-right">
                                {{ payment.rentalPeriod }}
                            </dd>
                        </div>
                    </dl>
                </section>
            </template>
        </div>
    </AppModal>
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
