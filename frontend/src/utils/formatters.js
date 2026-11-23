import dayjs from 'dayjs';

export function parseApiDate(dateInput) {
    if (!dateInput) return dayjs('');
    if (typeof dateInput === 'string') {
        const trimmed = dateInput.trim();
        if (!trimmed) return dayjs('');
        const normalized = trimmed.replace(
            /^(\d{4})-(\d{1,2})-(\d{1,2})([T\s].*)?$/,
            (_, year, month, day, time = '') =>
                `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}${time}`
        );
        return dayjs(normalized);
    }
    return dayjs(dateInput);
}

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
    const parsed = parseApiDate(dateInput);
    return parsed.isValid() ? parsed.format(format) : '-';
}

export function formatDateTime(dateInput, format = 'D MMM YYYY, HH:mm') {
    if (!dateInput) return '-';
    const parsed = parseApiDate(dateInput);
    return parsed.isValid() ? parsed.format(format) : '-';
}

export function formatDateRange(startDate, endDate, format = 'D MMM YYYY') {
    if (!startDate || !endDate) return '-';
    const start = parseApiDate(startDate);
    const end = parseApiDate(endDate);

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

export function formatDuration(months) {
    const count = Number(months);
    if (!Number.isFinite(count) || count <= 0) return '-';
    if (count === 12) return '1 Year';
    if (count % 12 === 0) return `${count / 12} Years`;
    return `${count} ${count === 1 ? 'Month' : 'Months'}`;
}