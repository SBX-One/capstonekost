export function trimString(value) {
    if (typeof value !== 'string') return value
    return value.trim()
}

export function stripTags(value) {
    if (typeof value !== 'string') return value
    return value.replace(/<[^>]*>/g, '')
}

export function sanitizeEmail(email) {
    if (typeof email !== 'string') return email
    return email.trim().toLowerCase()
}

export function sanitizePhone(phone) {
    if (typeof phone !== 'string') return phone
    return phone.trim().replace(/[^0-9+\-\s]/g, '')
}

export function sanitizeNumber(value, defaultValue = 0) {
    const num = Number(value)
    return isNaN(num) ? defaultValue : num
}

export function escapeHtml(text) {
    if (typeof text !== 'string') return text

    const htmlEntities = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    }

    return text.replace(/[&<>"'/]/g, char => htmlEntities[char])
}

export function sanitizeText(text) {
    return escapeHtml(stripTags(trimString(text)))
}

export function sanitizeAuthPayload(data) {
    if (!data || typeof data !== 'object') return {}

    return {
        ...data,
        name: data.name ? sanitizeText(data.name) : undefined,
        email: data.email ? sanitizeEmail(data.email) : undefined,
        phone: data.phone ? sanitizePhone(data.phone) : undefined,
        password: data.password ? data.password : undefined
    }
}

export function sanitizeRoomPayload(data) {
    if (!data || typeof data !== 'object') return {}

    return {
        ...data,
        name: data.name ? sanitizeText(data.name) : '',
        room_type: data.room_type ? sanitizeNumber(data.room_type, null) : null,
        floor: data.floor ? sanitizeNumber(data.floor, null) : null,
        price: data.price ? sanitizeNumber(data.price, 0) : 0,
        status: data.status === 'occupied' ? 'occupied' : 'available',
        overview: data.overview ? sanitizeText(data.overview) : '',
        description: data.description ? sanitizeText(data.description) : '',
        rules: data.rules ? sanitizeText(data.rules) : '',
        facilities: Array.isArray(data.facilities) ? data.facilities.map(id => sanitizeNumber(id)).filter(Boolean) : []
    }
}

export function sanitizeFacilityPayload(data) {
    if (!data || typeof data !== 'object') return {}

    return {
        ...data,
        name: data.name ? sanitizeText(data.name) : '',
        information: data.information ? sanitizeText(data.information) : '',
        icon_name: data.icon_name ? sanitizeText(data.icon_name) : 'Home'
    }
}

export function sanitizeRecordPaymentPayload(data) {
    if (!data || typeof data !== 'object') return {}

    const rawMethod = typeof data.method === 'string' ? data.method.trim().toLowerCase() : ''
    const cleanedNotes = typeof data.notes === 'string' ? sanitizeText(data.notes) : ''

    return {
        bookings_id: data.bookings_id ? sanitizeNumber(data.bookings_id, null) : null,
        payment_date: data.payment_date ? trimString(String(data.payment_date)) : '',
        amount: data.amount ? Math.trunc(sanitizeNumber(data.amount, 0)) : 0,
        method: ['transfer', 'cash'].includes(rawMethod) ? rawMethod : '',
        notes: cleanedNotes || null
    }
}

export function sanitizeExportPaymentParams(data) {
    if (!data || typeof data !== 'object') return {}

    const rawStatus = typeof data.status === 'string' ? data.status.trim().toLowerCase() : ''
    const normalizedStatus = rawStatus === 'partial' || rawStatus === 'partially_paid'
        ? 'partially paid'
        : rawStatus

    return {
        start_date: data.start_date ? trimString(String(data.start_date)) : '',
        end_date: data.end_date ? trimString(String(data.end_date)) : '',
        status: ['unpaid', 'partially paid', 'paid'].includes(normalizedStatus) ? normalizedStatus : undefined,
        room_id: data.room_id ? sanitizeNumber(data.room_id, null) : undefined
    }
}

export function sanitizeExportBookingParams(data) {
    if (!data || typeof data !== 'object') return {}

    const rawStatus = typeof data.status === 'string' ? data.status.trim().toLowerCase() : ''
    const validStatuses = ['pending', 'cancelled', 'rejected', 'approved', 'active', 'completed']

    return {
        start_date: data.start_date ? trimString(String(data.start_date)) : '',
        end_date: data.end_date ? trimString(String(data.end_date)) : '',
        status: validStatuses.includes(rawStatus) ? rawStatus : undefined,
        rooms: data.rooms ? sanitizeNumber(data.rooms, null) : undefined
    }
}

export function sanitizeExportRoomParams(data) {
    if (!data || typeof data !== 'object') return {}

    const rawStatus = typeof data.room_status === 'string' ? data.room_status.trim().toLowerCase() : ''

    return {
        room_status: ['available', 'occupied'].includes(rawStatus) ? rawStatus : undefined,
        room_type: data.room_type ? sanitizeNumber(data.room_type, null) : undefined,
        floors: data.floors ? sanitizeNumber(data.floors, null) : undefined
    }
}