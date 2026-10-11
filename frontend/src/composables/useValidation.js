import { reactive, computed } from "vue"
import { validate } from "@/utils/validators"

export function useValidation(rules) {
    const errors = reactive({})
    const touched = reactive({})

    Object.keys(rules).forEach(field => {
        errors[field] = ''
        touched[field] = false
    })

    function validateField(field, value) {
        touched[field] = true
        const fieldRules = rules[field] || []

        const result = validate(value, fieldRules)
        errors[field] = result.message

        return result.valid
    }

    function validateAll(formData) {
        let isValid = true

        Object.keys(rules).forEach(field => {
            touched[field] = true
            const fieldRules = rules[field] || []

            const result = validate(formData[field], fieldRules)
            errors[field] = result.message

            if (!result.valid) {
                isValid = false
            }
        })

        return isValid
    }

    const isValid = computed(() =>
        Object.values(errors).every(err => err === '')
    )

    function setFieldError(field, message) {
        if (field in errors) {
            touched[field] = true
            errors[field] = message
        }
    }

    function setErrors(errorMap) {
        if (!errorMap || typeof errorMap !== 'object') return
        Object.entries(errorMap).forEach(([field, message]) => {
            setFieldError(field, Array.isArray(message) ? message[0] : message)
        })
    }

    function clearErrors() {
        Object.keys(rules).forEach(field => {
            errors[field] = ''
            touched[field] = false
        })
    }

    return {
        errors,
        touched,
        validateField,
        validateAll,
        isValid,
        setFieldError,
        setErrors,
        clearErrors
    }
}