<script setup>
import { reactive, watch } from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import AppDropdown from '@/components/common/AppDropdown.vue';
import AppCalendarDropdown from '@/components/common/AppCalendarDropdown.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    title: {
        type: String,
        required: true,
    },
    subtitle: {
        type: String,
        default: '',
    },
    showDateRange: {
        type: Boolean,
        default: true,
    },
    dateSectionLabel: {
        type: String,
        default: 'Date Range',
    },
    startDateKey: {
        type: String,
        default: 'start_date',
    },
    endDateKey: {
        type: String,
        default: 'end_date',
    },
    startDateLabel: {
        type: String,
        default: 'Start Date',
    },
    endDateLabel: {
        type: String,
        default: 'End Date',
    },
    datePlaceholder: {
        type: String,
        default: 'Select date',
    },
    disableFutureDates: {
        type: Boolean,
        default: false,
    },
    filters: {
        type: Array,
        default: () => [],
    },
    validator: {
        type: Function,
        default: null,
    },
    isExporting: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: null,
    },
    validationErrors: {
        type: Object,
        default: () => ({}),
    },
    submitLabel: {
        type: String,
        default: 'Export CSV',
    },
    submittingLabel: {
        type: String,
        default: 'Exporting...',
    },
});

const emit = defineEmits(['close', 'submit', 'clear-error']);

const form = reactive({});

function buildInitialState() {
    const nextState = {};

    if (props.showDateRange) {
        nextState[props.startDateKey] = '';
        nextState[props.endDateKey] = '';
    }

    props.filters.forEach(filter => {
        if (filter?.key) {
            nextState[filter.key] = filter.defaultValue ?? '';
        }
    });

    return nextState;
}

function resetForm() {
    const freshState = buildInitialState();
    Object.keys(form).forEach(existingKey => {
        if (!(existingKey in freshState)) {
            delete form[existingKey];
        }
    });
    Object.assign(form, freshState);
}

resetForm();

const validation = props.validator
    ? props.validator(form)
    : {
          errors: reactive({}),
          validateField: () => true,
          validateAll: () => true,
          setFieldError: () => {},
          setErrors: () => {},
          clearErrors: () => {},
      };

const { errors, validateField, validateAll, setFieldError, setErrors, clearErrors } = validation;

watch(
    () => props.isOpen,
    isOpen => {
        if (isOpen) {
            resetForm();
            clearErrors();
        }
    }
);

watch(
    () => props.validationErrors,
    serverErrors => {
        if (serverErrors && Object.keys(serverErrors).length > 0) {
            setErrors(serverErrors);
        }
    },
    { deep: true }
);

function handleStartDateChange(value) {
    setFieldError(props.startDateKey, '');
    if (value && form[props.endDateKey]) {
        validateField(props.endDateKey, form[props.endDateKey]);
    }
}

function handleClose() {
    if (props.isExporting) return;
    emit('close');
}

function handleSubmit() {
    if (props.isExporting) return;
    emit('clear-error');

    if (!validateAll(form)) return;

    emit('submit', { ...form });
}
</script>

<template>
    <AppModal :is-open="isOpen" max-width="max-w-3xl" :persistent="isExporting" :hide-close-button="isExporting" @close="handleClose">
        <div role="region" aria-labelledby="export-modal-title" :aria-busy="isExporting" class="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-12">
            <header class="flex flex-col gap-1 pr-10 shrink-0">
                <h2 id="export-modal-title" class="text-h2 text-text-primary tracking-tight">
                    {{ title }}
                </h2>
                <p v-if="subtitle" class="text-body-md text-text-secondary">
                    {{ subtitle }}
                </p>
            </header>

            <form @submit.prevent="handleSubmit" class="flex flex-col gap-10" novalidate>
                <div v-if="error" role="alert" class="p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between gap-4">
                    <span class="text-body-md">{{ error }}</span>
                    <button type="button" @click="emit('clear-error')" aria-label="Dismiss error" class="text-body-sm font-semibold cursor-pointer shrink-0 focus:outline-none">Dismiss</button>
                </div>

                <fieldset v-if="showDateRange" class="flex flex-col gap-5 border-0 p-0 m-0">
                    <legend class="text-h4 text-text-primary p-0">
                        {{ dateSectionLabel }}
                    </legend>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-3 w-full">
                            <label :for="`export-${startDateKey}`" class="text-body-lg text-text-primary">
                                {{ startDateLabel }}
                            </label>
                            <AppCalendarDropdown
                                :id="`export-${startDateKey}`"
                                v-model="form[startDateKey]"
                                :placeholder="datePlaceholder"
                                size="md"
                                icon-position="right"
                                :allow-past-dates="true"
                                :disable-future-dates="disableFutureDates"
                                :has-error="Boolean(errors[startDateKey])"
                                @update:modelValue="handleStartDateChange"
                                @blur="validateField(startDateKey, form[startDateKey])"
                            />
                            <p v-if="errors[startDateKey]" role="alert" class="text-body-sm text-status-error">
                                {{ errors[startDateKey] }}
                            </p>
                        </div>

                        <div class="flex flex-col gap-3 w-full">
                            <label :for="`export-${endDateKey}`" class="text-body-lg text-text-primary">
                                {{ endDateLabel }}
                            </label>
                            <AppCalendarDropdown
                                :id="`export-${endDateKey}`"
                                v-model="form[endDateKey]"
                                :placeholder="datePlaceholder"
                                size="md"
                                icon-position="right"
                                :allow-past-dates="true"
                                :disable-future-dates="disableFutureDates"
                                :min-date="form[startDateKey] || ''"
                                :has-error="Boolean(errors[endDateKey])"
                                @update:modelValue="setFieldError(endDateKey, '')"
                                @blur="validateField(endDateKey, form[endDateKey])"
                            />
                            <p v-if="errors[endDateKey]" role="alert" class="text-body-sm text-status-error">
                                {{ errors[endDateKey] }}
                            </p>
                        </div>
                    </div>
                </fieldset>

                <div v-for="filter in filters" :key="filter.key" class="flex flex-col gap-3 w-full">
                    <label :for="`export-filter-${filter.key}`" class="text-h4 text-text-primary">
                        {{ filter.label }}
                    </label>
                    <AppDropdown
                        :id="`export-filter-${filter.key}`"
                        v-model="form[filter.key]"
                        :options="filter.options || []"
                        :placeholder="filter.placeholder || 'Select option'"
                        :disabled="Boolean(filter.disabled)"
                        :has-error="Boolean(errors[filter.key])"
                        divided
                        @update:modelValue="setFieldError(filter.key, '')"
                        @blur="validateField(filter.key, form[filter.key])"
                    />
                    <p v-if="errors[filter.key]" role="alert" class="text-body-sm text-status-error">
                        {{ errors[filter.key] }}
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <BaseButton type="button" variant="secondary" size="md" block="true" :disabled="isExporting" @click="handleClose"> Cancel </BaseButton>
                    <BaseButton type="submit" variant="primary" size="md" block="true" :disabled="isExporting">
                        {{ isExporting ? submittingLabel : submitLabel }}
                    </BaseButton>
                </div>
            </form>
        </div>
    </AppModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: var(--color-neutral-300, #dcdce2);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: var(--color-neutral-500, #9b9ba6);
}
</style>
