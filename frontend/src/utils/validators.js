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