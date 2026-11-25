<script setup>
import { ref, reactive, watch, nextTick, computed, onMounted } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useAdminPayment } from '@/composables/useAdminPayment';
import { useRecordPaymentValidation } from '@/composables/useRecordPaymentValidation';

import AppDropdown from '@/components/common/AppDropdown.vue';
import AppCalendarDropdown from '@/components/common/AppCalendarDropdown.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import AppSuccessModal from '@/components/common/AppSuccessModal.vue';

const router = useRouter();

const {
    bookingDropdownOptions,
    paymentMethodOptions,
    isFetchingBookings,
    isMutating,
    error,
    validationErrors,
    getRecordableBookingById,
    fetchRecordableBookings,
    submitPaymentRecord,
    clearError,
    formatRupiah,
} = useAdminPayment();

const form = reactive({
    bookings_id: '',
    amount: '',
    payment_date: '',
    method: '',
    notes: '',
});

const displayAmount = ref('');
const isSuccessModalOpen = ref(false);

const selectedBooking = computed(() => getRecordableBookingById(form.bookings_id));
const maxRemainingBalance = computed(() => selectedBooking.value?.remainingBalance ?? null);

const remainingBalanceHint = computed(() => {
    return maxRemainingBalance.value !== null ? `Remaining balance: ${formatRupiah(maxRemainingBalance.value)}` : '';
});

const bookingPlaceholder = computed(() => {
    if (isFetchingBookings.value) return 'Loading bookings...';
    if (bookingDropdownOptions.value.length === 0) return 'No eligible bookings available';
    return 'Select a Booking';
});

const isFormDirty = computed(() => {
    if (isSuccessModalOpen.value) return false;

    return form.bookings_id !== '' || form.amount !== '' || form.payment_date !== '' || form.method !== '' || String(form.notes ?? '').trim() !== '';
});

const isSubmitDisabled = computed(() => {
    return isMutating.value || !isFormDirty.value;
});

const { validateAll, validateField, errors, setFieldError, setErrors } = useRecordPaymentValidation(form, {
    maxAmount: maxRemainingBalance,
});

watch(
    () => form.bookings_id,
    () => {
        if (form.amount !== '') validateField('amount', form.amount);
    }
);

watch(validationErrors, serverErrors => {
    setErrors(serverErrors);
});

onBeforeRouteLeave((to, from, next) => {
    if (isFormDirty.value) {
        const answer = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
        answer ? next() : next(false);
    } else {
        next();
    }
});

const handleAmountInput = event => {
    setFieldError('amount', '');
    const numericValue = event.target.value.replace(/[^0-9]/g, '').slice(0, 15);
    form.amount = numericValue ? Number(numericValue) : '';
    displayAmount.value = numericValue ? formatRupiah(Number(numericValue)).replace(/Rp\s?/g, 'Rp ').trim() : '';
    event.target.value = displayAmount.value;
};

const submitForm = async () => {
    if (!validateAll(form)) return;

    const success = await submitPaymentRecord(form);
    if (success) {
        await nextTick();
        isSuccessModalOpen.value = true;
    }
};

onMounted(() => {
    fetchRecordableBookings(true);
});
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen">
        <header class="flex items-start gap-4 mb-16">
            <button
                type="button"
                @click="router.push({ name: 'admin-payments' })"
                aria-label="Back to Payment Management"
                class="mt-1.5 w-8 h-8 flex items-center justify-center rounded-full text-text-primary hover:bg-neutral-100 transition-colors cursor-pointer shrink-0 focus:outline-none"
            >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </button>

            <div class="flex flex-col gap-1">
                <h1 class="text-h2 text-text-primary tracking-tight">Recorded Payments</h1>
                <p class="text-body-lg text-text-secondary">Record a tenant's payment transaction</p>
            </div>
        </header>

        <div v-if="error" role="alert" class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between gap-4">
            <span class="text-body-md">{{ error }}</span>
            <button type="button" @click="clearError" aria-label="Dismiss error" class="text-body-sm font-semibold cursor-pointer shrink-0 focus:outline-none">Dismiss</button>
        </div>

        <form @submit.prevent="submitForm" class="flex flex-col gap-8" novalidate>
            <div class="flex flex-col gap-16">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="flex flex-col gap-3 w-full">
                        <label for="record-booking-select" class="text-body-lg text-text-primary flex items-center gap-1"> Select a Booking <span class="text-status-error">*</span></label>
                        <AppDropdown
                            id="record-booking-select"
                            v-model="form.bookings_id"
                            :options="bookingDropdownOptions"
                            :placeholder="bookingPlaceholder"
                            :disabled="isFetchingBookings || bookingDropdownOptions.length === 0"
                            :has-error="Boolean(errors.bookings_id)"
                            divided
                            @update:modelValue="setFieldError('bookings_id', '')"
                            @blur="validateField('bookings_id', form.bookings_id)"
                        >
                            <template #selected="{ selectedOption, selectedLabel }">
                                <span v-if="selectedOption" class="inline-flex items-center gap-2 truncate">
                                    <span class="text-text-primary font-semibold truncate">
                                        {{ selectedOption.tenantName || selectedLabel }}
                                    </span>
                                    <template v-if="selectedOption.roomName && selectedOption.roomName !== '-'">
                                        <span class="text-text-secondary font-normal" aria-hidden="true">&bull;</span>
                                        <span class="text-text-secondary font-normal shrink-0">
                                            {{ selectedOption.roomName }}
                                        </span>
                                    </template>
                                </span>
                                <span v-else class="truncate">{{ selectedLabel }}</span>
                            </template>

                            <template #option="{ option }">
                                <div class="flex items-center justify-between gap-4 w-full min-w-0">
                                    <span class="truncate">{{ option.tenantName || option.label }}</span>
                                    <span v-if="option.roomName && option.roomName !== '-'" class="text-text-secondary font-normal shrink-0">
                                        {{ option.roomName }}
                                    </span>
                                </div>
                            </template>
                        </AppDropdown>
                        <p v-if="errors.bookings_id" class="text-body-sm text-status-error">
                            {{ errors.bookings_id }}
                        </p>
                    </div>

                    <BaseInput
                        id="record-payment-amount"
                        v-model="displayAmount"
                        type="text"
                        inputmode="numeric"
                        label="Payment Amount"
                        placeholder="Enter Payment Amount"
                        variant="secondary"
                        required="true"
                        :hint="remainingBalanceHint"
                        :error="errors.amount"
                        @input="handleAmountInput"
                        @blur="validateField('amount', form.amount)"
                    />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div class="flex flex-col gap-3 w-full">
                        <label for="record-payment-date" class="text-body-lg text-text-primary flex items-center gap-1"> Payment Date <span class="text-status-error">*</span></label>
                        <AppCalendarDropdown
                            id="record-payment-date"
                            v-model="form.payment_date"
                            placeholder="Select payment date"
                            size="md"
                            icon-position="right"
                            :allow-past-dates="true"
                            :disable-future-dates="true"
                            :has-error="Boolean(errors.payment_date)"
                            @update:modelValue="setFieldError('payment_date', '')"
                            @blur="validateField('payment_date', form.payment_date)"
                        />
                        <p v-if="errors.payment_date" class="text-body-sm text-status-error">
                            {{ errors.payment_date }}
                        </p>
                    </div>

                    <div class="flex flex-col gap-3 w-full">
                        <label for="record-payment-method" class="text-body-lg text-text-primary flex items-center gap-1"> Payment Method <span class="text-status-error">*</span></label>
                        <AppDropdown
                            id="record-payment-method"
                            v-model="form.method"
                            :options="paymentMethodOptions"
                            placeholder="Select Payment Method"
                            :has-error="Boolean(errors.method)"
                            divided
                            @update:modelValue="setFieldError('method', '')"
                            @blur="validateField('method', form.method)"
                        />
                        <p v-if="errors.method" class="text-body-sm text-status-error">
                            {{ errors.method }}
                        </p>
                    </div>
                </div>

                <BaseInput
                    id="record-payment-notes"
                    v-model="form.notes"
                    type="textarea"
                    label="Notes"
                    placeholder="Enter additional notes"
                    variant="secondary"
                    :rows="5"
                    :error="errors.notes"
                    @update:modelValue="setFieldError('notes', '')"
                    @blur="validateField('notes', form.notes)"
                >
                    <template #label-action>
                        <span class="text-body-sm text-text-secondary">Optional</span>
                    </template>
                </BaseInput>
            </div>

            <div class="flex items-center justify-end gap-4">
                <BaseButton variant="secondary" type="button" size="md" :disabled="isMutating" @click="router.push({ name: 'admin-payments' })"> Cancel </BaseButton>
                <BaseButton type="submit" variant="primary" size="md" :disabled="isSubmitDisabled">
                    {{ isMutating ? 'Recording...' : 'Record Payment' }}
                </BaseButton>
            </div>
        </form>

        <AppSuccessModal
            :is-open="isSuccessModalOpen"
            title="Payment recorded successfully!"
            message="The tenant's payment transaction has been recorded."
            @close="router.push({ name: 'admin-payments' })"
        />
    </div>
</template>
