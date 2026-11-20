<script setup>
import PaymentStatusBadge from '@/components/common/PaymentStatusBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
    payment: {
        type: Object,
        required: true,
    },
});

defineEmits(['view-detail']);
</script>

<template>
    <article class="w-full bg-neutral-100 rounded-default p-6 flex flex-col gap-4">
        <header class="flex items-start justify-between gap-4">
            <h2 class="text-h3 text-text-primary tracking-tight">
                {{ payment.title }}
            </h2>
            <PaymentStatusBadge :status="payment.statusKey" :label="payment.badgeLabel" />
        </header>

        <hr class="border-t border-border-default m-0" />

        <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-12">
            <div class="flex flex-col gap-1 min-w-0">
                <span class="text-h5 text-text-secondary">{{ payment.dateLabel }}</span>
                <strong class="text-h2 tracking-tight wrap-break-word" :class="payment.dateValueClass">
                    {{ payment.dateValue }}
                </strong>
            </div>

            <div class="flex flex-col gap-1 min-w-0">
                <span class="text-h5 text-text-secondary">Payment Plan</span>
                <strong class="text-h3 text-text-primary">
                    {{ payment.paymentPlanLabel }}
                </strong>
            </div>
        </div>

        <hr class="border-t border-border-default m-0" />

        <dl class="flex flex-col gap-4 m-0">
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <dt class="text-h5 text-text-secondary">Rental Period</dt>
                <dd class="text-h4 text-text-primary text-right m-0">
                    {{ payment.rentalPeriod }}
                </dd>
            </div>

            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <dt class="text-h5 text-text-secondary">Total Amount</dt>
                <dd class="text-h4 text-text-primary text-right m-0">
                    {{ payment.totalAmount }}
                </dd>
            </div>

            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <dt class="text-h5 text-text-secondary">Total Paid</dt>
                <dd class="text-h4 text-text-primary text-right m-0">
                    {{ payment.totalPaid }}
                </dd>
            </div>
        </dl>

        <hr class="border-t border-border-default m-0" />

        <footer class="flex flex-col gap-4">
            <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span class="text-h5 text-text-secondary">{{ payment.footerLabel }}</span>
                <strong class="text-h3 tracking-tight text-right wrap-break-word" :class="payment.footerValueClass">
                    {{ payment.footerValue }}
                </strong>
            </div>

            <BaseButton variant="primary" size="sm" :aria-label="`View payment details for ${payment.title}`" @click="$emit('view-detail', payment.id)"> View Detail </BaseButton>
        </footer>
    </article>
</template>
