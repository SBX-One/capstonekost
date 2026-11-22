import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAdminPaymentStore } from '@/stores/adminPaymentStore';
import {
    formatRupiah,
    formatDate,
    formatDateRange,
    formatPaymentPlan,
} from '@/utils/formatters';
import {
    sanitizeRecordPaymentPayload,
    sanitizeExportPaymentParams,
} from '@/utils/sanitizers';

export const PAYMENT_METHOD_OPTIONS = [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank Transfer', value: 'transfer' },
];

export const EXPORT_PAYMENT_STATUS_OPTIONS = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Partially Paid', value: 'partially paid' },
    { label: 'Paid', value: 'paid' },
];

const PAYMENT_METHOD_LABELS = {
    cash: 'Cash',
    transfer: 'Bank Transfer',
    'bank transfer': 'Bank Transfer',
};

function formatPaymentMethod(rawMethod) {
    if (!rawMethod || typeof rawMethod !== 'string') return '-';
    const normalized = rawMethod.trim().toLowerCase();
    return PAYMENT_METHOD_LABELS[normalized] || rawMethod.trim();
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

function extractAdminPaymentContext(item) {
    const booking = item.booking_record || {};
    const payment = item.payment_record || item;
    const room = booking.room || {};
    const roomType = room.room_type || booking.room_type || {};
    const contact = room.contact || booking.contact || item.contact || {};

    const tenantName = contact.name ? String(contact.name).trim() : '-';
    const roomNumber = room.name || room.room_number || '-';
    const roomTypeName = roomType.name ? String(roomType.name).trim() : '';
    const roomDetailLabel = roomTypeName ? `${roomTypeName} ${roomNumber}` : roomNumber;

    const amountRaw = Number(payment.amount) || 0;
    const rawStatus = String(payment.payment_status || payment.status || 'paid')
        .toLowerCase()
        .trim();

    return {
        id: item.id ?? payment.id,
        booking,
        payment,
        room,
        roomType,
        tenantName,
        roomNumber,
        roomDetailLabel,
        amountRaw,
        formattedAmount: formatRupiah(amountRaw),
        paymentPlanLabel: formatPaymentPlan(payment.payment_plan),
        paymentDateLabel: formatDate(payment.payment_date),
        paymentMethodLabel: formatPaymentMethod(payment.payment_method),
        rentalPeriod: formatDateRange(booking.move_in, booking.move_out),
        statusKey: rawStatus || 'paid',
    };
}

export function useAdminPayment() {
    const adminPaymentStore = useAdminPaymentStore();

    const {
        paymentsMap,
        payments,
        paymentDetails,
        recordableBookings,
        isFetching,
        isFetchingDetail,
        isFetchingBookings,
        isMutating,
        isExporting,
        error,
        validationErrors,
        totalCount,
        totalPayments,
    } = storeToRefs(adminPaymentStore);

    function normalizePaymentRow(item) {
        if (!item) return null;

        const {
            id,
            tenantName,
            roomNumber,
            paymentPlanLabel,
            paymentDateLabel,
            amountRaw,
            formattedAmount,
            paymentMethodLabel,
        } = extractAdminPaymentContext(item);

        return {
            id,
            tenantName,
            roomNumber,
            paymentPlanLabel,
            paymentDateLabel,
            amountRaw,
            formattedAmount,
            paymentMethodLabel,
            raw: item,
        };
    }

    function normalizePaymentDetail(item) {
        if (!item) return null;

        const {
            id,
            payment,
            tenantName,
            roomDetailLabel,
            amountRaw,
            formattedAmount,
            paymentPlanLabel,
            paymentDateLabel,
            paymentMethodLabel,
            rentalPeriod,
            statusKey,
        } = extractAdminPaymentContext(item);

        const rawNotes = payment.payment_notes ?? payment.notes ?? '';
        const cleanedNotes = typeof rawNotes === 'string' ? rawNotes.trim() : '';

        return {
            id,
            statusKey,
            statusLabel: statusKey === 'paid' ? 'Paid' : statusKey,
            amountRaw,
            formattedAmount,
            paymentDateLabel,
            paymentMethodLabel,
            paymentPlanLabel,
            paymentNotes: cleanedNotes || '-',
            hasNotes: Boolean(cleanedNotes),
            tenantName,
            roomLabel: roomDetailLabel,
            rentalPeriod,
            raw: item,
        };
    }

    function normalizeRecordableBooking(item) {
        if (!item) return null;

        const id = Number(item.id);
        if (!Number.isInteger(id) || id <= 0) return null;

        const tenantName = item.name ? String(item.name).trim() : 'Unknown Tenant';
        const roomName = item.room ? String(item.room).trim() : '-';

        const rawBalance = item.remaining_balance ?? item.amount_left ?? item.total_left;
        const parsedBalance = Number(rawBalance);
        const remainingBalance =
            rawBalance !== undefined &&
                rawBalance !== null &&
                Number.isFinite(parsedBalance) &&
                parsedBalance > 0
                ? parsedBalance
                : null;

        return {
            id,
            value: id,
            label: `${tenantName} - ${roomName}`,
            tenantName,
            roomName,
            remainingBalance,
            raw: item,
        };
    }

    const formattedPayments = computed(() =>
        payments.value.map(normalizePaymentRow).filter(Boolean)
    );

    const bookingDropdownOptions = computed(() =>
        recordableBookings.value.map(normalizeRecordableBooking).filter(Boolean)
    );

    function getRawPaymentDetailById(id) {
        return lookupRecordById(paymentDetails.value, id);
    }

    function getPaymentDetailById(id) {
        return normalizePaymentDetail(getRawPaymentDetailById(id));
    }

    function getRecordableBookingById(id) {
        return (
            bookingDropdownOptions.value.find(option => String(option.id) === String(id)) ||
            null
        );
    }

    async function submitPaymentRecord(rawFormData) {
        const cleanPayload = sanitizeRecordPaymentPayload(rawFormData);
        return await adminPaymentStore.createPaymentRecord(cleanPayload);
    }

    async function downloadPaymentsCsv(rawFilterParams = {}) {
        const cleanParams = sanitizeExportPaymentParams(rawFilterParams);
        const result = await adminPaymentStore.exportPayments(cleanParams);

        if (!result?.blob) {
            return false;
        }

        if (typeof window !== 'undefined' && typeof document !== 'undefined') {
            const blobUrl = window.URL.createObjectURL(result.blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', result.filename || 'payments.csv');
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => {
                window.URL.revokeObjectURL(blobUrl);
            }, 100);
        }

        return true;
    }

    return {
        paymentsMap,
        payments,
        formattedPayments,
        paymentDetails,
        recordableBookings,
        bookingDropdownOptions,
        isFetching,
        isFetchingDetail,
        isFetchingBookings,
        isMutating,
        isExporting,
        error,
        validationErrors,
        totalCount,
        totalPayments,

        paymentMethodOptions: PAYMENT_METHOD_OPTIONS,
        exportStatusOptions: EXPORT_PAYMENT_STATUS_OPTIONS,

        normalizePaymentRow,
        normalizePaymentDetail,
        normalizeRecordableBooking,
        getRawPaymentDetailById,
        getPaymentDetailById,
        getRecordableBookingById,
        formatRupiah,

        fetchPayments: adminPaymentStore.fetchPayments,
        fetchPaymentDetails: adminPaymentStore.fetchPaymentDetails,
        fetchRecordableBookings: adminPaymentStore.fetchRecordableBookings,
        createPaymentRecord: adminPaymentStore.createPaymentRecord,
        submitPaymentRecord,
        exportPayments: adminPaymentStore.exportPayments,
        downloadPaymentsCsv,
        clearError: adminPaymentStore.clearError,
        clearValidationErrors: adminPaymentStore.clearValidationErrors,
        clearCache: adminPaymentStore.clearCache,
    };
}