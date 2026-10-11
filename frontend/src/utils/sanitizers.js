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