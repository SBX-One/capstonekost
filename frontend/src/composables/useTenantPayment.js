import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTenantPaymentStore } from '@/stores/tenantPaymentStore';
import {
    formatRupiah,
    formatDate,
    formatDateTime,
    formatDateRange,
    formatPaymentPlan,
} from '@/utils/formatters';

export const PAYMENT_FILTER_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Partially Paid', value: 'partial' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Paid', value: 'paid' },
    { label: 'Cancelled', value: 'cancelled' },
];

const STATUS_UI_MAP = {
    unpaid: {
        badgeLabel: 'Unpaid',
        badgeClass: 'bg-status-pending-bg text-status-pending',
        dateLabel: 'Initial Payment Deadline',
        dateValueClass: 'text-text-primary',
        footerLabel: 'Remaining Balance',
        footerValueClass: 'text-text-primary',
    },
    partial: {
        badgeLabel: 'Partially Paid',
        badgeClass: 'bg-blue-50 text-blue-600',
        dateLabel: 'Next Payment Due',
        dateValueClass: 'text-text-primary',
        footerLabel: 'Remaining Balance',
        footerValueClass: 'text-text-primary',
    },
    overdue: {
        badgeLabel: 'Overdue',
        badgeClass: 'bg-status-error-bg text-status-error',
        dateLabel: 'Original Due Date',
        dateValueClass: 'text-status-error',
        footerLabel: 'Remaining Balance',
        footerValueClass: 'text-status-error',
    },
    paid: {
        badgeLabel: 'Paid',
        badgeClass: 'bg-status-success-bg text-status-success',
        dateLabel: 'Due Date',
        dateValueClass: 'text-text-primary',
        footerLabel: 'Remaining Balance',
        footerValueClass: 'text-text-primary',
    },
    cancelled: {
        badgeLabel: 'Canceled',
        badgeClass: 'bg-status-error-bg text-status-error',
        dateLabel: 'Cancellation Date',
        dateValueClass: 'text-text-primary',
        footerLabel: 'Cancellation Reason',
        footerValueClass: 'text-text-primary',
    },
};

function resolveStatusKey(rawStatus, cancellationReason) {
    if (cancellationReason || rawStatus === 'cancelled' || rawStatus === 'canceled') return 'cancelled';
    if (['partial', 'partially paid', 'partially_paid'].includes(rawStatus)) return 'partial';
    if (rawStatus === 'overdue') return 'overdue';
    if (rawStatus === 'paid') return 'paid';
    return 'unpaid';
}

export function useTenantPayment() {
    const tenantPaymentStore = useTenantPaymentStore();

    const {
        paymentsMap,
        payments,
        paymentDetails,
        isFetching,
        isFetchingDetail,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalPayments,
        counts,
    } = storeToRefs(tenantPaymentStore);

    function normalizePaymentCard(item) {
        if (!item) return null;

        const booking = item.booking_record || {};
        const payment = item.payment_record || {};
        const room = booking.room || {};
        const roomType = room.room_type || {};

        const rawStatus = String(payment.status || '').toLowerCase().trim();
        const cancellationReason = booking.cancellation_reason || null;
        const statusKey = resolveStatusKey(rawStatus, cancellationReason);
        const ui = STATUS_UI_MAP[statusKey];

        const totalAmountRaw = Number(booking.total) || 0;
        const totalPaidRaw = Number(payment.total_paid) || 0;
        const amountLeftRaw = payment.amount_left !== undefined && payment.amount_left !== null
            ? Number(payment.amount_left)
            : Math.max(0, totalAmountRaw - totalPaidRaw);

        const dateValueMap = {
            unpaid: formatDateTime(payment.due_date),
            partial: formatDate(payment.due_date),
            overdue: formatDate(payment.due_date),
            paid: 'Payment Completed',
            cancelled: formatDate(booking.cancelled_at || booking.updated_at || payment.due_date),
        };

        const footerValue = statusKey === 'cancelled'
            ? (cancellationReason || 'Cancelled')
            : formatRupiah(statusKey === 'paid' ? 0 : amountLeftRaw);

        return {
            id: item.id,
            statusKey,
            isCancelled: statusKey === 'cancelled',
            title: `${roomType.name || 'Room'} • ${room.name || '-'}`,
            ...ui,
            dateValue: dateValueMap[statusKey],
            paymentPlanLabel: formatPaymentPlan(payment.payment_plan || booking.payment_plan),
            rentalPeriod: formatDateRange(booking.move_in, booking.move_out),
            totalAmount: formatRupiah(totalAmountRaw),
            totalPaid: formatRupiah(totalPaidRaw),
            footerValue,
            raw: item,
        };
    }

    const formattedPayments = computed(() => payments.value.map(normalizePaymentCard).filter(Boolean));

    return {
        paymentsMap,
        payments,
        formattedPayments,
        paymentDetails,
        isFetching,
        isFetchingDetail,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalPayments,
        counts,

        filterTabs: PAYMENT_FILTER_TABS,
        normalizePaymentCard,
        formatRupiah,

        fetchPayments: tenantPaymentStore.fetchPayments,
        fetchPaymentDetail: tenantPaymentStore.fetchPaymentDetail,
        confirmPaymentPlan: tenantPaymentStore.confirmPaymentPlan,
        clearError: tenantPaymentStore.clearError,
        clearValidationErrors: tenantPaymentStore.clearValidationErrors,
        clearCache: tenantPaymentStore.clearCache,
    };
}