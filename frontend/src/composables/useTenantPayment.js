import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTenantPaymentStore } from '@/stores/tenantPaymentStore';
import {
    parseApiDate,
    formatRupiah,
    formatDate,
    formatDateTime,
    formatDateRange,
    formatPaymentPlan,
    formatDuration,
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

const VALID_BOOKING_STATUSES = [
    'available',
    'occupied',
    'pending',
    'active',
    'completed',
    'complete',
    'rejected',
    'canceled',
    'cancelled',
    'approved',
];

function resolveStatusKey(rawStatus, hasCancellation) {
    if (hasCancellation || rawStatus === 'cancelled' || rawStatus === 'canceled') return 'cancelled';
    if (['partial', 'partially paid', 'partially_paid'].includes(rawStatus)) return 'partial';
    if (rawStatus === 'overdue') return 'overdue';
    if (rawStatus === 'paid') return 'paid';
    return 'unpaid';
}

function resolveBookingStatus(rawStatus) {
    const normalized = String(rawStatus || '').toLowerCase().trim();
    return VALID_BOOKING_STATUSES.includes(normalized) ? normalized : 'approved';
}

function normalizePlanKey(rawPlan) {
    const normalized = String(rawPlan || '').toLowerCase().trim();
    if (normalized === 'monthly' || normalized === 'monthly payment') return 'monthly';
    if (normalized === 'full' || normalized === 'full payment') return 'full';
    return '';
}

function resolveDurationMonths(booking) {
    const rawDuration = Number(booking?.rental_duration);
    if (Number.isFinite(rawDuration) && rawDuration > 0) return rawDuration;

    if (booking?.move_in && booking?.move_out) {
        const start = parseApiDate(booking.move_in);
        const end = parseApiDate(booking.move_out);
        if (start.isValid() && end.isValid() && end.isAfter(start)) {
            return Math.max(1, Math.ceil(end.diff(start, 'month', true)));
        }
    }
    return 1;
}

function lookupRecordById(collection, id) {
    if (id === undefined || id === null || id === '' || !collection) return null;

    if (collection instanceof Map) {
        return (
            collection.get(Number(id)) ||
            collection.get(id) ||
            collection.get(String(id)) ||
            null
        );
    }

    if (Array.isArray(collection)) {
        return collection.find(item => String(item?.id) === String(id)) || null;
    }

    return collection[id] || collection[String(id)] || null;
}

function extractPaymentContext(item) {
    const booking = item.booking_information || item.booking_record || item;
    const payment = item.payment_record || item;
    const upcoming = item.upcoming_payment || null;
    const room = booking.room || {};
    const roomType = booking.room_type || room.room_type || {};

    const rawStatus = String(payment.payment_status || payment.status || '').toLowerCase().trim();
    const cancellationObj = booking.cancellation && typeof booking.cancellation === 'object' ? booking.cancellation : null;
    const cancellationReason = cancellationObj?.reason || booking.cancellation_reason || null;
    const cancellationDateRaw = cancellationObj?.cancellation_date || booking.cancelled_at || payment.cancelled_at || booking.updated_at || null;
    const hasCancellation = Boolean(cancellationReason || cancellationObj?.cancellation_date);
    const statusKey = resolveStatusKey(rawStatus, hasCancellation);

    return {
        id: item.id ?? payment.id ?? booking.id,
        booking,
        payment,
        upcoming,
        room,
        roomType,
        cancellationReason,
        cancellationDateRaw,
        statusKey,
        ui: STATUS_UI_MAP[statusKey],
        rawPlan: payment.payment_plan || booking.payment_plan || '',
        rentalPeriod: formatDateRange(booking.move_in, booking.move_out),
        roomNumber: booking.name || room.name || room.room_number || '-',
    };
}

export function useTenantPayment() {
    const tenantPaymentStore = useTenantPaymentStore();

    const {
        paymentsMap,
        payments,
        currentPayments,
        paymentDetails,
        isFetching,
        isFetchingCurrent,
        isFetchingDetail,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalPayments,
        counts,
    } = storeToRefs(tenantPaymentStore);

    function getRawCurrentPaymentById(id) {
        return lookupRecordById(currentPayments.value, id);
    }

    function getRawPaymentDetailById(id) {
        return lookupRecordById(paymentDetails.value, id);
    }

    function normalizePaymentCard(item) {
        if (!item) return null;

        const {
            id,
            payment,
            roomType,
            cancellationReason,
            cancellationDateRaw,
            statusKey,
            ui,
            rawPlan,
            rentalPeriod,
            roomNumber,
        } = extractPaymentContext(item);

        const totalAmountRaw = Number(payment.total ?? item.booking_information?.total ?? item.booking_record?.total) || 0;
        const totalPaidRaw = Number(payment.total_paid) || 0;
        const rawRemaining = payment.total_left ?? payment.amount_left;
        const amountLeftRaw =
            rawRemaining !== undefined && rawRemaining !== null
                ? Number(rawRemaining)
                : Math.max(0, totalAmountRaw - totalPaidRaw);

        const dateValueMap = {
            unpaid: formatDateTime(payment.due_date),
            partial: formatDate(payment.due_date),
            overdue: formatDate(payment.due_date),
            paid: 'Payment Completed',
            cancelled: formatDate(cancellationDateRaw || payment.due_date),
        };

        const footerValue =
            statusKey === 'cancelled'
                ? cancellationReason || 'Cancelled'
                : formatRupiah(statusKey === 'paid' ? 0 : amountLeftRaw);

        return {
            id,
            statusKey,
            isCancelled: statusKey === 'cancelled',
            title: `${roomType.name || 'Room'} • ${roomNumber}`,
            ...ui,
            dateValue: dateValueMap[statusKey],
            paymentPlanLabel: formatPaymentPlan(rawPlan),
            rentalPeriod,
            totalAmount: formatRupiah(totalAmountRaw),
            totalPaid: formatRupiah(totalPaidRaw),
            footerValue,
            raw: item,
        };
    }

    function normalizeCurrentPayment(item) {
        if (!item) return null;

        const {
            id,
            booking,
            payment,
            upcoming,
            room,
            statusKey,
            ui,
            rawPlan,
            rentalPeriod,
            roomNumber,
        } = extractPaymentContext(item);

        const durationMonths = resolveDurationMonths(booking);
        const roomPrice = Number(room.price) || 0;
        const rawTotal = Number(booking.total ?? payment.total);
        const totalCostRaw =
            (booking.total !== undefined && booking.total !== null && Number.isFinite(rawTotal)) ||
                (payment.total !== undefined && payment.total !== null && Number.isFinite(rawTotal))
                ? rawTotal
                : roomPrice * durationMonths;

        const monthlyCostRaw =
            roomPrice > 0
                ? roomPrice
                : durationMonths > 0
                    ? Math.round(totalCostRaw / durationMonths)
                    : totalCostRaw;

        const confirmedPlan = normalizePlanKey(rawPlan);

        const hasUpcomingAmount =
            upcoming?.amount !== undefined &&
            upcoming?.amount !== null &&
            Number.isFinite(Number(upcoming.amount));

        const upcomingAmountRaw = hasUpcomingAmount
            ? Number(upcoming.amount)
            : confirmedPlan === 'monthly'
                ? monthlyCostRaw
                : totalCostRaw;

        return {
            id,
            billingId: payment.id ?? item.id ?? booking.id,
            roomLabel: roomNumber,
            rentalPeriod,
            durationLabel: formatDuration(durationMonths),
            bookingStatus: resolveBookingStatus(booking.status),
            totalCostRaw,
            monthlyCostRaw,
            formattedTotalCost: formatRupiah(totalCostRaw),
            formattedMonthlyCost: formatRupiah(monthlyCostRaw),
            confirmedPlan,
            summaryPlanLabel: confirmedPlan ? formatPaymentPlan(confirmedPlan) : '-',
            statusKey,
            statusLabel: ui.badgeLabel,
            upcomingPayment: {
                hasApiAmount: hasUpcomingAmount,
                amountRaw: upcomingAmountRaw,
                formattedAmount: formatRupiah(upcomingAmountRaw),
                dueDateRaw: upcoming?.due_date || null,
                dueDateLabel: 'Within 24 hours',
            },
            deadlineSource: {
                payment_deadline: upcoming?.due_date || payment.due_date || payment.payment_deadline,
                approved_at: booking.approved_at || booking.updated_at || booking.created_at,
            },
            raw: item,
        };
    }

    function normalizePaymentDetail(item) {
        if (!item) return null;

        const {
            id,
            booking,
            payment,
            roomType,
            cancellationReason,
            cancellationDateRaw,
            statusKey,
            ui,
            rawPlan,
            rentalPeriod,
            roomNumber,
        } = extractPaymentContext(item);

        const totalAmountRaw = Number(payment.total ?? booking.total) || 0;
        const totalPaidRaw = Number(payment.total_paid) || 0;
        const rawRemaining = payment.total_left ?? payment.amount_left;
        const totalLeftRaw =
            rawRemaining !== undefined && rawRemaining !== null
                ? Number(rawRemaining)
                : Math.max(0, totalAmountRaw - totalPaidRaw);

        const rawGraceDays = Number(payment.grace_days_remaining ?? item.grace_days_remaining);
        const graceDaysRemaining = Number.isFinite(rawGraceDays) && rawGraceDays > 0 ? rawGraceDays : 14;

        return {
            id: payment.id ?? id,
            paymentId: payment.id ?? null,
            bookingId: booking.id ?? null,
            statusKey,
            statusLabel: ui.badgeLabel,
            isOverdue: statusKey === 'overdue',
            isCancelled: statusKey === 'cancelled',
            gracePeriodTitle: `${graceDaysRemaining} Days Remaining`,
            gracePeriodDescription: 'Please settle your overdue payment within the grace period to avoid automatic booking cancellation.',
            paymentPlanLabel: formatPaymentPlan(rawPlan),
            formattedTotalAmount: formatRupiah(totalAmountRaw),
            formattedTotalPaid: formatRupiah(totalPaidRaw),
            formattedRemainingBalance: formatRupiah(statusKey === 'paid' ? 0 : totalLeftRaw),
            cancellationReason: cancellationReason || '-',
            cancellationDateLabel: formatDate(cancellationDateRaw),
            roomLabel: `${roomType.name || 'Room'} ${roomNumber}`,
            rentalPeriod,
            raw: item,
        };
    }

    function getCurrentPaymentById(id) {
        return normalizeCurrentPayment(getRawCurrentPaymentById(id));
    }

    function getPaymentDetailById(id) {
        return normalizePaymentDetail(getRawPaymentDetailById(id));
    }

    const formattedPayments = computed(() =>
        payments.value.map(normalizePaymentCard).filter(Boolean)
    );

    return {
        paymentsMap,
        payments,
        formattedPayments,
        currentPayments,
        paymentDetails,
        isFetching,
        isFetchingCurrent,
        isFetchingDetail,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalPayments,
        counts,

        filterTabs: PAYMENT_FILTER_TABS,
        getRawCurrentPaymentById,
        getCurrentPaymentById,
        getRawPaymentDetailById,
        getPaymentDetailById,
        normalizePaymentCard,
        normalizeCurrentPayment,
        normalizePaymentDetail,
        formatRupiah,

        fetchPayments: tenantPaymentStore.fetchPayments,
        fetchCurrentPayment: tenantPaymentStore.fetchCurrentPayment,
        fetchPaymentDetails: tenantPaymentStore.fetchPaymentDetails,
        confirmPaymentPlan: tenantPaymentStore.confirmPaymentPlan,
        clearError: tenantPaymentStore.clearError,
        clearValidationErrors: tenantPaymentStore.clearValidationErrors,
        clearCache: tenantPaymentStore.clearCache,
    };
}