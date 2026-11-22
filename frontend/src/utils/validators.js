import dayjs from 'dayjs'

export function required(value, fieldName = 'This field') {
    if (
        value === null ||
        value === undefined ||
        value === '' ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)
    ) {
        return {
            valid: false,
            message: `${fieldName} is required.`
        }
    }
    return { valid: true, message: '' }
}

export function isValidEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, message: 'Please enter a valid email address.' }
    }

    const cleanEmail = email.trim()
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

    if (!emailRegex.test(cleanEmail)) {
        return {
            valid: false,
            message: 'Please enter a valid email address.'
        }
    }
    return { valid: true, message: '' }
}

export function minLength(value, min, fieldName = 'This field') {
    if (value === null || value === undefined) {
        return { valid: false, message: `${fieldName} is required.` }
    }

    const stringValue = String(value).trim()
    if (stringValue.length < min) {
        return { valid: false, message: `${fieldName} must be at least ${min} characters.` }
    }
    return { valid: true, message: '' }
}

export function maxLength(value, max, fieldName = 'This field') {
    if (value === null || value === undefined) return { valid: true, message: '' }

    const stringValue = String(value).trim()
    if (stringValue.length > max) {
        return {
            valid: false,
            message: `${fieldName} must not exceed ${max} characters.`
        }
    }
    return { valid: true, message: '' }
}

export function isValidPhone(phone) {
    if (!phone) return { valid: false, message: 'Phone number is required.' }

    const stringPhone = String(phone).trim()
    const phoneRegex = /^[0-9+\-\s]{9,20}$/

    if (!phoneRegex.test(stringPhone)) {
        return {
            valid: false,
            message: 'Please enter a valid phone number (min. 9 digits).'
        }
    }
    return { valid: true, message: '' }
}

export function isNumeric(value, fieldName = 'This field') {
    if (value === null || value === undefined || value === '') {
        return { valid: false, message: `${fieldName} is required.` }
    }
    if (isNaN(Number(value))) {
        return { valid: false, message: `${fieldName} must be a valid number.` }
    }
    return { valid: true, message: '' }
}

export function minValue(value, min, fieldName = 'This field') {
    const num = Number(value)
    if (isNaN(num) || num < min) {
        return { valid: false, message: `${fieldName} must be at least ${min}.` }
    }
    return { valid: true, message: '' }
}

export function validate(value, validators) {
    for (const validator of validators) {
        const result = validator(value)
        if (!result.valid) return result
    }
    return { valid: true, message: '' }
}

export function isWebPFile(file, fieldName = 'File') {
    if (!file) return { valid: true, message: '' }

    if (file.type !== 'image/webp' && !file.name.toLowerCase().endsWith('.webp')) {
        return { valid: false, message: `${fieldName} failed to convert or is not a valid .webp format.` }
    }
    return { valid: true, message: '' }
}

export function maxFileSize(file, maxSizeMB, fieldName = 'File') {
    if (!file) return { valid: true, message: '' }

    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
        return { valid: false, message: `${fieldName} must not exceed ${maxSizeMB}MB.` }
    }
    return { valid: true, message: '' }
}

export function validateFileArray(files, maxFiles = 4, maxSizeMB = 2, fieldName = 'File') {
    if (!files || !Array.isArray(files)) {
        return { valid: true, message: '' }
    }

    if (files.length > maxFiles) {
        return { valid: false, message: `Maximum ${maxFiles} ${fieldName}s are allowed.` }
    }

    for (const [index, currentFile] of files.entries()) {
        if (currentFile) {
            if (!(currentFile instanceof File || currentFile instanceof Blob)) {
                return { valid: false, message: `Data in slot ${index + 1} is corrupted or not a valid file.` }
            }

            const slotLabel = `${fieldName} slot ${index + 1}`

            const formatValidation = isWebPFile(currentFile, slotLabel)
            if (!formatValidation.valid) return formatValidation

            const sizeValidation = maxFileSize(currentFile, maxSizeMB, slotLabel)
            if (!sizeValidation.valid) return sizeValidation
        }
    }

    return { valid: true, message: '' }
}

export function isValidDate(value, fieldName = 'Date') {
    if (!value) return { valid: true, message: '' }

    if (!dayjs(value).isValid()) {
        return { valid: false, message: `${fieldName} is not a valid date format.` }
    }
    return { valid: true, message: '' }
}

export function minDateToday(value, fieldName = 'Date') {
    if (!value) return { valid: true, message: '' }

    const date = dayjs(value).startOf('day')
    const today = dayjs().startOf('day')

    if (date.isBefore(today)) {
        return { valid: false, message: `${fieldName} cannot be in the past.` }
    }
    return { valid: true, message: '' }
}

export function isAfterDate(value, compareDate, fieldName = 'Date', compareFieldName = 'previous date') {
    if (!value || !compareDate) return { valid: true, message: '' }

    const date = dayjs(value).startOf('day')
    const compare = dayjs(compareDate).startOf('day')

    if (date.isBefore(compare) || date.isSame(compare)) {
        return { valid: false, message: `${fieldName} must be strictly after ${compareFieldName}.` }
    }
    return { valid: true, message: '' }
}

export function isPositiveInteger(value, fieldName = 'This field') {
    if (value === null || value === undefined || value === '') {
        return { valid: true, message: '' }
    }

    const num = Number(value)
    if (!Number.isInteger(num) || num <= 0) {
        return {
            valid: false,
            message: `${fieldName} must be a valid positive integer.`
        }
    }
    return { valid: true, message: '' }
}

export function isStrictIsoDate(value, fieldName = 'Date') {
    if (!value) return { valid: true, message: '' }

    const raw = String(value).trim()
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)

    if (!match) {
        return {
            valid: false,
            message: `${fieldName} must be in YYYY-MM-DD format.`
        }
    }

    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const parsed = dayjs(`${match[1]}-${match[2]}-${match[3]}`)

    if (
        !parsed.isValid() ||
        parsed.year() !== year ||
        parsed.month() + 1 !== month ||
        parsed.date() !== day
    ) {
        return {
            valid: false,
            message: `${fieldName} is not a valid calendar date.`
        }
    }

    return { valid: true, message: '' }
}

export function isSameOrAfterDate(value, compareDate, fieldName = 'End Date', compareFieldName = 'Start Date') {
    if (!value || !compareDate) return { valid: true, message: '' }

    const target = dayjs(String(value).trim()).startOf('day')
    const baseline = dayjs(String(compareDate).trim()).startOf('day')

    if (!target.isValid() || !baseline.isValid()) {
        return { valid: true, message: '' }
    }

    if (target.isBefore(baseline)) {
        return {
            valid: false,
            message: `${fieldName} must be on or after ${compareFieldName}.`
        }
    }

    return { valid: true, message: '' }
}