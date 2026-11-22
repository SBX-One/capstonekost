<script setup>
import { computed } from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import PaymentStatusBadge from '@/components/common/PaymentStatusBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const SKELETON_SECTIONS_BY_ROLE = Object.freeze({
    admin: [
        {
            key: 'admin-payment-skel',
            titleWidth: 'w-48',
            showDividers: true,
            rows: [
                { labelWidth: 'w-28', valueWidth: 'w-24' },
                { labelWidth: 'w-32', valueWidth: 'w-28' },
                { labelWidth: 'w-24', valueWidth: 'w-32' },
                { labelWidth: 'w-28', valueWidth: 'w-36' },
            ],
        },
        {
            key: 'admin-booking-skel',
            titleWidth: 'w-44',
            showDividers: true,
            rows: [
                { labelWidth: 'w-24', valueWidth: 'w-28' },
                { labelWidth: 'w-14', valueWidth: 'w-36' },
                { labelWidth: 'w-24', valueWidth: 'w-40' },
            ],
        },
    ],
    tenant: [
        {
            key: 'tenant-payment-skel',
            titleWidth: 'w-48',
            showDividers: false,
            rows: [
                { labelWidth: 'w-40', valueWidth: 'w-24', isBadge: true },
                { labelWidth: 'w-24', valueWidth: 'w-28' },
                { labelWidth: 'w-24', valueWidth: 'w-24' },
                { labelWidth: 'w-20', valueWidth: 'w-24' },
                { labelWidth: 'w-32', valueWidth: 'w-24' },
            ],
        },
        {
            key: 'tenant-booking-skel',
            titleWidth: 'w-44',
            showDividers: false,
            rows: [
                { labelWidth: 'w-14', valueWidth: 'w-36' },
                { labelWidth: 'w-24', valueWidth: 'w-40' },
            ],
        },
    ],
});

const DETAIL_SECTION_BUILDERS = {
    admin: data => [
        {
            id: 'payment-info-heading',
            title: 'Payment Information',
            showDividers: true,
            rows: [
                { label: 'Payment Date', value: data.paymentDateLabel ?? '-' },
                { label: 'Payment Method', value: data.paymentMethodLabel ?? '-' },
                { label: 'Payment Plan', value: data.paymentPlanLabel ?? '-' },
                { label: 'Payment Notes', value: data.paymentNotes || '-', multiline: true },
            ],
        },
        {
            id: 'booking-info-heading',
            title: 'Booking Information',
            showDividers: true,
            rows: [
                { label: 'Tenant Name', value: data.tenantName ?? '-' },
                { label: 'Room', value: data.roomLabel ?? '-' },
                { label: 'Rental Period', value: data.rentalPeriod ?? '-' },
            ],
        },
    ],
    tenant: data => {
        const paymentRows = [
            { label: 'Current Payment Status', isBadge: true },
            { label: 'Payment Plan', value: data.paymentPlanLabel ?? '-' },
            { label: 'Total Amount', value: data.formattedTotalAmount ?? '-' },
            { label: 'Total Paid', value: data.formattedTotalPaid ?? '-' },
        ];

        if (!data.isCancelled) {
            paymentRows.push({
                label: 'Remaining Balance',
                value: data.formattedRemainingBalance ?? '-',
            });
        }

        const sections = [
            {
                id: 'payment-info-heading',
                title: 'Payment Information',
                showDividers: false,
                rows: paymentRows,
            },
        ];

        if (data.isCancelled) {
            sections.push({
                id: 'cancellation-info-heading',
                title: 'Cancellation Information',
                showDividers: false,
                rows: [
                    { label: 'Cancellation Reason', value: data.cancellationReason ?? '-' },
                    { label: 'Cancellation Date', value: data.cancellationDateLabel ?? '-' },
                ],
            });
        }

        sections.push({
            id: 'booking-info-heading',
            title: 'Booking Information',
            showDividers: false,
            rows: [
                { label: 'Room', value: data.roomLabel ?? '-' },
                { label: 'Rental Period', value: data.rentalPeriod ?? '-' },
            ],
        });

        return sections;
    },
};

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    role: {
        type: String,
        default: 'tenant',
        validator: val => ['tenant', 'admin'].includes(val),
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

const isAdmin = computed(() => props.role === 'admin');

const skeletonSections = computed(() => SKELETON_SECTIONS_BY_ROLE[props.role] || SKELETON_SECTIONS_BY_ROLE.tenant);

const detailSections = computed(() => {
    if (!props.payment) return [];
    const buildSections = DETAIL_SECTION_BUILDERS[props.role] || DETAIL_SECTION_BUILDERS.tenant;
    return buildSections(props.payment);
});

const handleClose = () => {
    emit('close');
};
</script>

<template>
    <AppModal :isOpen="isOpen" maxWidth="max-w-xl" @close="handleClose">
        <div role="region" aria-labelledby="payment-detail-modal-title" :aria-busy="isLoading && !payment" class="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 flex flex-col gap-6 sm:gap-8">
            <header class="flex items-center justify-between pr-10 shrink-0">
                <h2 id="payment-detail-modal-title" class="text-h3 text-text-primary tracking-tight">Payment Details</h2>
            </header>

            <div v-if="isLoading && !payment" role="status" aria-label="Loading payment details" class="flex flex-col gap-6 sm:gap-8 animate-pulse">
                <div v-if="isAdmin" aria-hidden="true" class="flex items-start justify-between gap-4 shrink-0">
                    <div class="flex flex-col gap-1">
                        <div class="h-6 w-28 bg-neutral-200 rounded-md"></div>
                        <div class="h-8 w-36 bg-neutral-200 rounded-md"></div>
                    </div>
                    <div class="h-8 w-20 bg-neutral-200 rounded-xl shrink-0"></div>
                </div>

                <div v-for="section in skeletonSections" :key="section.key" aria-hidden="true" class="flex flex-col gap-3 shrink-0">
                    <div class="h-7 bg-neutral-200 rounded-md" :class="section.titleWidth"></div>

                    <div class="bg-surface-default rounded-default py-6 px-4 flex flex-col gap-4">
                        <div
                            v-for="(row, rowIdx) in section.rows"
                            :key="`${section.key}-row-${rowIdx}`"
                            class="flex items-center justify-between gap-4"
                            :class="section.showDividers ? 'pb-4 border-b border-border-default last:pb-0 last:border-b-0' : ''"
                        >
                            <div class="h-6 bg-neutral-200 rounded-md" :class="row.labelWidth"></div>
                            <div :class="['bg-neutral-200', row.isBadge ? 'h-8 rounded-xl shrink-0' : 'h-6 rounded-md', row.valueWidth]"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="error && !payment" role="alert" class="p-6 rounded-default bg-status-error-bg border border-status-error flex flex-col items-center text-center gap-4">
                <p class="text-body-md text-status-error">{{ error }}</p>
                <BaseButton variant="secondary" size="sm" @click="emit('retry')"> Try Again </BaseButton>
            </div>

            <template v-else-if="payment">
                <div v-if="isAdmin" class="flex items-start justify-between gap-4 shrink-0">
                    <div class="flex flex-col gap-1 min-w-0">
                        <span class="text-body-md text-text-secondary">Payment Amount</span>
                        <p class="text-h3 leading-8 text-text-primary tracking-tight m-0">
                            {{ payment.formattedAmount ?? '-' }}
                        </p>
                    </div>
                    <PaymentStatusBadge :status="payment.statusKey" :label="payment.statusLabel" />
                </div>

                <div v-else-if="payment.isOverdue" role="status" aria-live="polite" class="flex flex-col gap-2">
                    <p class="text-h3 text-status-error tracking-tight">
                        {{ payment.gracePeriodTitle }}
                    </p>
                    <p class="text-body-sm text-text-secondary">
                        {{ payment.gracePeriodDescription }}
                    </p>
                </div>

                <section v-for="section in detailSections" :key="section.id" :aria-labelledby="section.id" class="flex flex-col gap-3">
                    <h3 :id="section.id" class="text-h4 leading-7 text-text-primary">{{ section.title }}</h3>

                    <dl class="bg-surface-default rounded-default py-6 px-4 flex flex-col gap-4 m-0">
                        <div
                            v-for="row in section.rows"
                            :key="row.label"
                            class="flex justify-between gap-4"
                            :class="[row.multiline ? 'items-start' : 'items-center', section.showDividers ? 'pb-4 border-b border-border-default last:pb-0 last:border-b-0' : '']"
                        >
                            <dt class="text-body-md text-text-secondary shrink-0">{{ row.label }}</dt>

                            <dd v-if="row.isBadge" class="m-0 flex items-center">
                                <PaymentStatusBadge :status="payment.statusKey" :label="payment.statusLabel" />
                            </dd>

                            <dd v-else class="m-0 text-label-btn-md text-text-primary text-right" :class="row.multiline ? 'max-w-xs wrap-break-word' : ''">
                                {{ row.value }}
                            </dd>
                        </div>
                    </dl>
                </section>
            </template>

            <div v-else role="status" class="p-6 rounded-default bg-surface-default text-center text-body-md text-text-secondary">Payment details not found.</div>
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
