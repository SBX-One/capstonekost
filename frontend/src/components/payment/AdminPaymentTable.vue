<script setup>
import AdminPaymentTableRow from '@/components/payment/AdminPaymentTableRow.vue';

defineProps({
    payments: {
        type: Array,
        required: true,
        default: () => [],
    },
    isLoading: {
        type: Boolean,
        default: false,
    },
});

defineEmits(['view']);
</script>

<template>
    <div class="bg-bg-default border border-border-default rounded-default overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-225">
                <thead>
                    <tr class="border-b border-border-default bg-neutral-100 text-body-md text-text-secondary uppercase tracking-wider">
                        <th class="py-3.5 px-4 font-medium">Name</th>
                        <th class="py-3.5 px-4 font-medium">Room</th>
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Payment Plan</th>
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Payment Date</th>
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Payment Amount</th>
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Payment Method</th>
                        <th class="py-3.5 px-4 font-medium text-center">Action</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="isLoading">
                        <td colspan="7" class="py-12 text-center text-text-secondary text-body-md">
                            <div class="inline-flex items-center gap-2">
                                <svg class="animate-spin -ml-1 mr-3 h-5 text-action-primary" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span>Loading payment records...</span>
                            </div>
                        </td>
                    </tr>

                    <tr v-else-if="payments.length === 0">
                        <td colspan="7" class="py-12 text-center text-text-secondary text-body-md">No payment transactions found.</td>
                    </tr>

                    <template v-else>
                        <AdminPaymentTableRow v-for="payment in payments" :key="payment.id" :payment="payment" @view="$emit('view', payment)" />
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>
