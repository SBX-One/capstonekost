<script setup>
import { reactive, computed, watch } from 'vue';
import AppModal from '@/components/common/AppModal.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import RoomImageUploader from '@/components/rooms/RoomImageUploader.vue';
import { useAdminComplaint } from '@/composables/useAdminComplaint';
import { useAdminComplaintValidation } from '@/composables/useAdminComplaintValidation';
import { sanitizeStartHandlingIssuePayload, sanitizeResolveIssuePayload } from '@/utils/sanitizers';

const ACTION_MODE_CONFIG = Object.freeze({
    handle: {
        submitLabel: 'Send Update',
        submittingLabel: 'Sending...',
        submitVariant: 'primary',
        systemErrorKeys: ['issue_id'],
    },
    resolve: {
        submitLabel: 'Mark as Completed',
        submittingLabel: 'Completing...',
        submitVariant: 'success',
        systemErrorKeys: ['response_id', 'issues_id'],
    },
});

const props = defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    mode: {
        type: String,
        default: 'handle',
        validator: val => ['handle', 'resolve'].includes(val),
    },
    issue: {
        type: Object,
        default: null,
    },
});

const emit = defineEmits(['close', 'success']);

const { isMutating, error, validationErrors, startHandlingIssue, resolveIssue, clearError, clearValidationErrors } = useAdminComplaint();

const validatorsByMode = {
    handle: useAdminComplaintValidation('handle'),
    resolve: useAdminComplaintValidation('resolve'),
};

const isResolveMode = computed(() => props.mode === 'resolve');
const modeConfig = computed(() => ACTION_MODE_CONFIG[props.mode] || ACTION_MODE_CONFIG.handle);
const activeValidator = computed(() => validatorsByMode[props.mode] || validatorsByMode.handle);
const activeErrors = computed(() => activeValidator.value.errors);

const form = reactive({
    issue_id: null,
    issues_id: null,
    response_id: null,
    description: '',
    images: [null, null, null, null],
    deleted_images: [],
});

const existingImages = computed(() => (isResolveMode.value ? props.issue?.adminResponse?.images || [] : []));

const submitButtonLabel = computed(() => (isMutating.value ? modeConfig.value.submittingLabel : modeConfig.value.submitLabel));

const systemValidationError = computed(() => {
    const errorKey = modeConfig.value.systemErrorKeys.find(key => activeErrors.value[key]);
    return errorKey ? activeErrors.value[errorKey] : '';
});

function clearStoreFeedback() {
    clearError();
    clearValidationErrors();
}

function resetFormState() {
    const issueId = props.issue?.id ?? null;
    const response = props.issue?.adminResponse;

    form.issue_id = issueId;
    form.issues_id = issueId;
    form.response_id = response?.id ?? null;
    form.description = isResolveMode.value ? response?.description || '' : '';
    form.images = [null, null, null, null];
    form.deleted_images = [];

    validatorsByMode.handle.clearErrors();
    validatorsByMode.resolve.clearErrors();
    clearStoreFeedback();
}

watch(
    () => [props.isOpen, props.mode, props.issue?.id],
    ([isOpen]) => {
        if (isOpen) resetFormState();
    },
    { immediate: true }
);

watch(
    () => form.images,
    newImages => {
        if (props.isOpen) {
            activeValidator.value.validateField('images', newImages);
        }
    },
    { deep: true }
);

watch(
    validationErrors,
    serverErrors => {
        if (!props.isOpen || !serverErrors || Object.keys(serverErrors).length === 0) return;

        const normalizedErrors = Object.entries(serverErrors).reduce((acc, [key, messages]) => {
            const targetKey = key.startsWith('images.') ? 'images' : key;
            if (!acc[targetKey]) acc[targetKey] = messages;
            return acc;
        }, {});

        activeValidator.value.setErrors(normalizedErrors);
    },
    { deep: true }
);

function handleRemoveExistingImage(imageId) {
    if (imageId && !form.deleted_images.includes(imageId)) {
        form.deleted_images.push(imageId);
    }
}

function handleClose() {
    if (isMutating.value) return;
    clearStoreFeedback();
    emit('close');
}

async function handleSubmit() {
    if (isMutating.value) return;
    clearStoreFeedback();

    if (!activeValidator.value.validateAll(form)) return;

    const cleanData = isResolveMode.value ? sanitizeResolveIssuePayload(form) : sanitizeStartHandlingIssuePayload(form);

    const formData = new FormData();

    if (isResolveMode.value) {
        formData.append('_method', 'PATCH');
    }

    Object.entries(cleanData).forEach(([key, value]) => {
        if (key !== 'images' && key !== 'deleted_images' && value !== null && value !== undefined && value !== '') {
            formData.append(key, value);
        }
    });

    if (Array.isArray(cleanData.deleted_images) && cleanData.deleted_images.length > 0) {
        cleanData.deleted_images.forEach(id => formData.append('deleted_images[]', id));
    }

    cleanData.images.forEach((file, index) => {
        if (file) formData.append(`images[${index}]`, file);
    });

    const success = isResolveMode.value ? await resolveIssue(formData) : await startHandlingIssue(formData);

    if (success) {
        emit('success', {
            mode: props.mode,
            issueId: props.issue?.id ?? null,
        });
    }
}
</script>

<template>
    <AppModal :is-open="isOpen" max-width="max-w-2xl" :persistent="isMutating" :hide-close-button="isMutating" @close="handleClose">
        <form
            @submit.prevent="handleSubmit"
            novalidate
            aria-labelledby="update-issue-modal-title"
            aria-describedby="update-issue-modal-subtitle"
            :aria-busy="isMutating"
            class="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-12"
        >
            <header class="flex flex-col gap-1 pr-10 shrink-0">
                <h2 id="update-issue-modal-title" class="text-h3 text-text-primary tracking-tight">Update Issue Report</h2>
                <p id="update-issue-modal-subtitle" class="text-body-md text-text-secondary">Share an update on the progress of this reported issues with the tenant.</p>
            </header>

            <div class="flex flex-col gap-6">
                <div
                    v-if="error || systemValidationError"
                    role="alert"
                    class="p-3.5 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between gap-4"
                >
                    <span class="text-body-sm">{{ error || systemValidationError }}</span>
                    <button v-if="error" type="button" @click="clearError" aria-label="Dismiss error" class="text-body-sm font-semibold cursor-pointer shrink-0 focus:outline-none">Dismiss</button>
                </div>

                <BaseInput
                    v-model="form.description"
                    type="textarea"
                    variant="secondary"
                    label="Issues Description"
                    placeholder="Describe the actions taken or the current progress of this issue..."
                    :rows="5"
                    :disabled="isMutating"
                    :error="activeErrors.description"
                    @update:modelValue="activeValidator.setFieldError('description', '')"
                    @blur="activeValidator.validateField('description', form.description)"
                />

                <section aria-labelledby="update-issue-upload-label" class="flex flex-col gap-8">
                    <div class="flex flex-col gap-3">
                        <div class="flex flex-wrap items-center gap-2">
                            <h3 id="update-issue-upload-label" class="text-body-lg text-text-primary">Update Issue Report</h3>
                            <span class="inline-flex items-center justify-center px-3 py-1 text-label-badge rounded-xl tracking-wide select-none shrink-0 bg-neutral-200 text-text-secondary">
                                Optional
                            </span>
                        </div>
                        <p class="text-body-sm text-text-secondary">Upload photos to show the current condition or progress of the issue. JPG or PNG, maximum 4 photos.</p>
                    </div>

                    <RoomImageUploader v-if="isOpen" v-model="form.images" :existing-images="existingImages" :error="activeErrors.images" @remove-existing="handleRemoveExistingImage" />
                </section>
            </div>

            <div class="flex flex-col-reverse sm:flex-row items-center gap-3 w-full">
                <BaseButton variant="secondary" size="sm" type="button" :block="true" :disabled="isMutating" @click="handleClose"> Cancel </BaseButton>

                <BaseButton :variant="modeConfig.submitVariant" size="sm" type="submit" :block="true" :disabled="isMutating">
                    {{ submitButtonLabel }}
                </BaseButton>
            </div>
        </form>
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
