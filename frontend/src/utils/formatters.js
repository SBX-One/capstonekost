import dayjs from 'dayjs';

export function formatRupiah(amount) {
    const numericAmount = Number(amount);
    const safeAmount = Number.isFinite(numericAmount) && numericAmount !== 0 ? numericAmount : 0;

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    })
        .format(safeAmount)
        .replace(/\u00a0|\s+/g, '');
}

export function formatDate(dateInput, format = 'D MMM YYYY') {
    if (!dateInput) return '-';
    const parsed = dayjs(dateInput);
    return parsed.isValid() ? parsed.format(format) : '-';
}

export function formatDateTime(dateInput, format = 'D MMM YYYY, HH:mm') {
    if (!dateInput) return '-';
    const parsed = dayjs(dateInput);
    return parsed.isValid() ? parsed.format(format) : '-';
}

export function formatDateRange(startDate, endDate, format = 'D MMM YYYY') {
    if (!startDate || !endDate) return '-';
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    if (!start.isValid() || !end.isValid()) return '-';
    return `${start.format(format)} – ${end.format(format)}`;
}

export function formatPaymentPlan(plan) {
    if (!plan || typeof plan !== 'string') return 'Not Selected';

    const normalized = plan.trim().toLowerCase();
    if (normalized === 'monthly' || normalized === 'monthly payment') {
        return 'Monthly Payment';
    }
    if (normalized === 'full' || normalized === 'full payment') {
        return 'Full Payment';
    }

    return plan;
}