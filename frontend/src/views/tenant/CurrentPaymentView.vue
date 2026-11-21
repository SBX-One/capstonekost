<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

import { useTenantPayment } from '@/composables/useTenantPayment';
import { usePaymentCountdown } from '@/composables/usePaymentCountdown';
import { formatPaymentPlan } from '@/utils/formatters';

import RoomStatusBadge from '@/components/common/RoomStatusBadge.vue';
import PaymentStatusBadge from '@/components/common/PaymentStatusBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import PaymentCountdownSection from '@/components/payment/PaymentCountdownSection.vue';
import PaymentPlanCard from '@/components/payment/PaymentPlanCard.vue';
import ConfirmPaymentPlanModal from '@/components/payment/ConfirmPaymentPlanModal.vue';
import PaymentInstructionsSection from '@/components/payment/PaymentInstructionsSection.vue';

const props = defineProps({
    id: {
        type: [String, Number],
        required: true,
    },
});

const router = useRouter();

const { isFetchingDetail, isMutating, error, getRawDetailById, normalizeCurrentPayment, fetchPaymentDetail, confirmPaymentPlan, clearError } = useTenantPayment();

const selectedPlan = ref('');
const localConfirmedPlan = ref('');
const isConfirmModalOpen = ref(false);
const actionError = ref('');

const currentPayment = computed(() => {
    const raw = getRawDetailById(props.id);
    return normalizeCurrentPayment(raw);
});

const { formattedRemainingTime, formattedDeadline, isApproaching, isExpired } = usePaymentCountdown(() => currentPayment.value?.deadlineSource);

const activeConfirmedPlan = computed(() => {
    return localConfirmedPlan.value || currentPayment.value?.confirmedPlan || '';
});

const isPlanConfirmed = computed(() => Boolean(activeConfirmedPlan.value));

const summaryPlanLabel = computed(() => {
    return activeConfirmedPlan.value ? formatPaymentPlan(activeConfirmedPlan.value) : '-';
});

const modalAmountLabel = computed(() => {
    if (!currentPayment.value) return 'Rp0';
    return selectedPlan.value === 'monthly' ? currentPayment.value.formattedMonthlyCost : currentPayment.value.formattedTotalCost;
});

const planHelperText = computed(() => {
    if (isExpired.value) return 'The 24-hour payment setup window has expired.';
    if (selectedPlan.value) return 'Plan selected. Continue to review and confirm';
    return 'Select a payment plan to continue';
});

async function loadCurrentPayment() {
    if (!props.id) {
        router.replace('/tenant/bookings');
        return;
    }
    clearError();
    actionError.value = '';
    await fetchPaymentDetail(props.id);
}

function handleBack() {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.push('/tenant/bookings');
    }
}

function handleSelectPlan(planKey) {
    if (isExpired.value || isMutating.value || isPlanConfirmed.value) return;
    selectedPlan.value = planKey;
    actionError.value = '';
}

function handleOpenModal() {
    if (!selectedPlan.value || isExpired.value) return;
    actionError.value = '';
    isConfirmModalOpen.value = true;
}

async function handleConfirm() {
    if (!selectedPlan.value || isMutating.value) return;
    actionError.value = '';

    const success = await confirmPaymentPlan(props.id, selectedPlan.value);
    if (success) {
        localConfirmedPlan.value = selectedPlan.value;
    } else {
        actionError.value = error.value || 'Failed to confirm your payment plan. Please try again.';
    }
    isConfirmModalOpen.value = false;
}

watch(
    () => props.id,
    (newId, oldId) => {
        if (newId && newId !== oldId) {
            selectedPlan.value = '';
            localConfirmedPlan.value = '';
            loadCurrentPayment();
        }
    }
);

onMounted(() => {
    loadCurrentPayment();
});
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen" :aria-busy="isFetchingDetail">
        <div class="flex flex-col gap-6 mb-16">
            <button type="button" @click="handleBack" class="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors w-fit cursor-pointer focus-visible:outline-none">
                <svg class="w-5 h-5 shrink-0" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M3.33398 10H16.6673" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor" />
                    <path d="M8.33398 5L3.33398 10L8.33398 15" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor" />
                </svg>
                <span class="text-body-lg">Booking History</span>
            </button>

            <header class="flex flex-col gap-1">
                <h1 class="text-h2 text-text-primary tracking-tight">Current Payment</h1>
                <p class="text-body-lg text-text-secondary">Review and complete payment setup for this booking</p>
            </header>
        </div>

        <div
            v-if="error || actionError"
            role="alert"
            class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between gap-4 animate-fade-in"
        >
            <span class="text-body-md">{{ actionError || error }}</span>
            <div class="flex items-center gap-4 shrink-0">
                <button v-if="error" type="button" @click="loadCurrentPayment" class="text-label-btn-md cursor-pointer">Retry</button>
                <button v-if="actionError" type="button" @click="actionError = ''" class="text-label-btn-md cursor-pointer">Dismiss</button>
            </div>
        </div>

        <div v-if="isFetchingDetail && !currentPayment" class="flex flex-col gap-12 mb-8 animate-pulse" aria-busy="true" aria-label="Loading current payment details">
            <div class="flex flex-col gap-6">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-neutral-200 shrink-0"></div>
                    <div class="space-y-2 w-full max-w-md">
                        <div class="h-7 bg-neutral-200 rounded-md w-60"></div>
                        <div class="h-5 bg-neutral-200 rounded-md w-full"></div>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="bg-neutral-200 rounded-default p-8 flex flex-col items-center gap-3">
                        <div class="h-5 bg-neutral-300 rounded-md w-32"></div>
                        <div class="h-12 bg-neutral-300 rounded-md w-48"></div>
                    </div>
                    <div class="bg-neutral-200 rounded-default p-8 flex flex-col items-center gap-3">
                        <div class="h-5 bg-neutral-300 rounded-md w-36"></div>
                        <div class="h-12 bg-neutral-300 rounded-md w-64"></div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-neutral-100 rounded-default p-6 flex flex-col gap-6">
                    <div class="h-7 bg-neutral-200 rounded-md w-48"></div>
                    <div class="space-y-4">
                        <div v-for="i in 4" :key="'info-skel-' + i" class="h-6 bg-neutral-200 rounded-md w-full"></div>
                    </div>
                </div>
                <div class="bg-neutral-100 rounded-default p-6 flex flex-col gap-6">
                    <div class="h-7 bg-neutral-200 rounded-md w-44"></div>
                    <div class="flex flex-col items-center gap-2 py-4">
                        <div class="h-10 bg-neutral-200 rounded-md w-52"></div>
                        <div class="h-5 bg-neutral-200 rounded-md w-32"></div>
                    </div>
                    <div class="space-y-4">
                        <div class="h-6 bg-neutral-200 rounded-md w-full"></div>
                        <div class="h-6 bg-neutral-200 rounded-md w-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <template v-else-if="currentPayment" class="flex flex-col gap-12">
            <PaymentCountdownSection :remaining-time="formattedRemainingTime" :deadline-label="formattedDeadline" :is-approaching="isApproaching" :is-expired="isExpired" />

            <section aria-label="Booking and payment summary" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <article class="bg-neutral-100 rounded-default p-6 flex flex-col gap-6">
                    <h2 class="text-h3 text-text-primary tracking-tight">Booking Information</h2>

                    <dl class="flex flex-col gap-4 m-0">
                        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <dt class="text-h4 text-text-secondary">Room</dt>
                            <dd class="text-h4 text-text-primary text-right m-0">{{ currentPayment.roomLabel }}</dd>
                        </div>

                        <hr class="border-t border-border-default m-0" />

                        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <dt class="text-h4 text-text-secondary">Rental Period</dt>
                            <dd class="text-h4 text-text-primary text-right m-0">{{ currentPayment.rentalPeriod }}</dd>
                        </div>

                        <hr class="border-t border-border-default m-0" />

                        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <dt class="text-h4 text-text-secondary">Rental Duration</dt>
                            <dd class="text-h4 text-text-primary text-right m-0">{{ currentPayment.durationLabel }}</dd>
                        </div>

                        <hr class="border-t border-border-default m-0" />

                        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <dt class="text-h4 text-text-secondary">Booking Status</dt>
                            <dd class="m-0">
                                <RoomStatusBadge :status="currentPayment.bookingStatus" />
                            </dd>
                        </div>
                    </dl>
                </article>

                <article class="bg-neutral-100 rounded-default p-6 flex flex-col justify-between gap-6">
                    <h2 class="text-h3 text-text-primary tracking-tight">Payment Summary</h2>

                    <div class="flex flex-col items-center text-center gap-1 py-2">
                        <strong class="text-h2 text-text-primary tracking-tight wrap-break-word">
                            {{ currentPayment.formattedTotalCost }}
                        </strong>
                        <span class="text-body-lg text-text-secondary">Total Rental Cost</span>
                    </div>

                    <dl class="flex flex-col gap-4 m-0">
                        <hr class="border-t border-border-default m-0" />

                        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <dt class="text-h4 text-text-secondary">Payment Plan</dt>
                            <dd class="text-h4 text-text-primary text-right m-0">{{ summaryPlanLabel }}</dd>
                        </div>

                        <hr class="border-t border-border-default m-0" />

                        <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                            <dt class="text-h4 text-text-secondary">Payment Status</dt>
                            <dd class="m-0">
                                <PaymentStatusBadge :status="currentPayment.statusKey" :label="currentPayment.statusLabel" />
                            </dd>
                        </div>
                    </dl>
                </article>
            </section>

            <PaymentInstructionsSection v-if="isPlanConfirmed" />

            <section v-else aria-labelledby="plan-selection-heading" class="flex flex-col gap-6">
                <header class="flex flex-col gap-1">
                    <h2 id="plan-selection-heading" class="text-h3 text-text-primary tracking-tight">Payment Plan Selection <span class="text-status-error" aria-hidden="true">*</span></h2>
                    <p class="text-body-lg text-text-secondary">Choose one payment plan to continue with your rental payment</p>
                </header>

                <div role="radiogroup" aria-labelledby="plan-selection-heading" aria-required="true" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PaymentPlanCard
                        title="Monthly Payment"
                        :amount="currentPayment.formattedMonthlyCost"
                        subtitle="Per month"
                        :selected="selectedPlan === 'monthly'"
                        :disabled="isExpired || isMutating"
                        @select="handleSelectPlan('monthly')"
                    />

                    <PaymentPlanCard
                        title="Full Payment"
                        :amount="currentPayment.formattedTotalCost"
                        subtitle="One-time payment"
                        :selected="selectedPlan === 'full'"
                        :disabled="isExpired || isMutating"
                        @select="handleSelectPlan('full')"
                    />
                </div>

                <footer class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <p class="text-label-btn-md text-text-secondary" aria-live="polite">
                        {{ planHelperText }}
                    </p>

                    <BaseButton variant="primary" size="md" :disabled="!selectedPlan || isExpired || isSubmitting" @click="handleOpenModal"> Continue </BaseButton>
                </footer>
            </section>

            <ConfirmPaymentPlanModal
                :is-open="isConfirmModalOpen"
                :plan="selectedPlan"
                :formatted-amount="modalAmountLabel"
                :duration-label="currentPayment.durationLabel"
                :is-submitting="isMutating"
                @close="isConfirmModalOpen = false"
                @confirm="handleConfirm"
            />
        </template>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-out both;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-8px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
