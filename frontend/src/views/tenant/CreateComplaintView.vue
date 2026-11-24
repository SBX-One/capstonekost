<script setup>
import { ref, reactive, watch, nextTick, computed, onMounted } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useTenantComplaint } from '@/composables/useTenantComplaint';
import { useTenantComplaintValidation } from '@/composables/useTenantComplaintValidation';
import { sanitizeCreateIssuePayload } from '@/utils/sanitizers';

import AppDropdown from '@/components/common/AppDropdown.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import RoomImageUploader from '@/components/rooms/RoomImageUploader.vue';

const router = useRouter();
const { activeRoomOptions, isFetchingFormRooms, isMutating, error, validationErrors, fetchActiveRooms, createIssue, clearError, clearValidationErrors } = useTenantComplaint();
const { validateAll, validateField, errors, setFieldError, setErrors } = useTenantComplaintValidation();

const selectedLocationKey = ref('');

const form = reactive({
    room_id: null,
    location_name: '',
    title: '',
    description: '',
    images: [null, null, null, null],
});

const isFormDirty = ref(false);

const isSubmitDisabled = computed(() => {
    return isMutating.value || isFetchingFormRooms.value || !isFormDirty.value;
});

onMounted(() => {
    clearError();
    clearValidationErrors();
    fetchActiveRooms();
});

watch(
    form,
    () => {
        isFormDirty.value = true;
    },
    { deep: true }
);

watch(
    () => form.images,
    newImages => {
        validateField('images', newImages);
    },
    { deep: true }
);

watch(
    validationErrors,
    serverErrors => {
        if (!serverErrors || Object.keys(serverErrors).length === 0) return;

        const normalizedErrors = Object.entries(serverErrors).reduce((acc, [key, messages]) => {
            const targetKey = key.startsWith('images.') ? 'images' : key;
            if (!acc[targetKey]) acc[targetKey] = messages;
            return acc;
        }, {});

        setErrors(normalizedErrors);
    },
    { deep: true }
);

onBeforeRouteLeave((to, from, next) => {
    if (isMutating.value) {
        next(false);
        return;
    }

    if (isFormDirty.value) {
        const answer = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
        answer ? next() : next(false);
    } else {
        next();
    }
});

const handleLocationChange = optionKey => {
    setFieldError('location_name', '');
    setFieldError('room_id', '');

    const matched = optionKey ? activeRoomOptions.value.find(opt => opt.value === optionKey) : null;
    form.room_id = matched ? matched.room_id : null;
    form.location_name = matched ? matched.location_name : '';
};

const goBack = () => {
    router.push({ name: 'tenant-complaints' });
};

const submitForm = async () => {
    clearError();
    if (!validateAll(form)) return;

    const cleanData = sanitizeCreateIssuePayload(form);
    const formData = new FormData();

    Object.entries(cleanData).forEach(([key, value]) => {
        if (key !== 'images' && value !== null && value !== undefined && value !== '') {
            formData.append(key, value);
        }
    });

    cleanData.images.forEach((file, index) => {
        if (file) formData.append(`images[${index}]`, file);
    });

    const success = await createIssue(formData);
    if (success) {
        isFormDirty.value = false;
        await nextTick();
        router.push({ name: 'tenant-complaints' });
    }
};
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen">
        <header class="mb-16">
            <button
                type="button"
                @click="goBack"
                class="inline-flex items-center gap-2 text-body-md text-text-secondary hover:text-text-primary transition-colors mb-6 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm"
            >
                <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M4 12H20" stroke-width="1.7" stroke-linejoin="round" stroke="currentColor" />
                    <path d="M10 6L4 12L10 18" stroke-width="1.7" stroke-linejoin="round" stroke="currentColor" />
                </svg>

                <span>Back to Report Issues</span>
            </button>

            <div class="flex flex-col gap-1">
                <h1 class="text-h2 text-text-primary tracking-tight">Report an Issue</h1>
                <p class="text-body-lg text-text-secondary">Let us know if something needs attention during your stay. We're here to help.</p>
            </div>
        </header>

        <div v-if="error" role="alert" class="mb-6 p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex items-center justify-between gap-4">
            <span class="text-body-md">{{ error }}</span>
            <button v-if="activeRoomOptions.length === 0" type="button" @click="fetchActiveRooms(true)" class="text-label-btn-md shrink-0 cursor-pointer focus-visible:outline-none">Retry</button>
        </div>

        <form @submit.prevent="submitForm" novalidate>
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
                <div class="lg:col-span-7 flex flex-col gap-6">
                    <div class="flex flex-col gap-3 w-full">
                        <label for="issue-location-select" class="text-body-lg text-text-primary">Issues Location</label>
                        <AppDropdown
                            id="issue-location-select"
                            v-model="selectedLocationKey"
                            :options="activeRoomOptions"
                            :placeholder="isFetchingFormRooms ? 'Loading locations...' : 'Select a issues location'"
                            :disabled="isFetchingFormRooms || isMutating"
                            :has-error="Boolean(errors.location_name || errors.room_id)"
                            :aria-describedby="errors.location_name || errors.room_id ? 'issue-location-error' : undefined"
                            @update:modelValue="handleLocationChange"
                            @blur="validateField('location_name', form.location_name)"
                        />
                        <p v-if="errors.location_name || errors.room_id" id="issue-location-error" role="alert" class="text-body-sm text-status-error">
                            {{ errors.location_name || errors.room_id }}
                        </p>
                    </div>

                    <BaseInput
                        v-model="form.title"
                        label="Issues Title"
                        placeholder="Enter a short title for your issue"
                        variant="secondary"
                        :disabled="isMutating"
                        :error="errors.title"
                        @update:modelValue="setFieldError('title', '')"
                        @blur="validateField('title', form.title)"
                    />

                    <BaseInput
                        v-model="form.description"
                        type="textarea"
                        label="Issues Description"
                        placeholder="Describe the issue, when it occurred, and any details that may help us understand the problem..."
                        variant="secondary"
                        :rows="5"
                        :disabled="isMutating"
                        :error="errors.description"
                        @update:modelValue="setFieldError('description', '')"
                        @blur="validateField('description', form.description)"
                    />

                    <aside aria-labelledby="stay-connected-title" class="w-full bg-neutral-100 border border-border-default rounded-default px-3 py-4 flex items-start gap-4">
                        <svg class="w-6 h-6 text-text-primary shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path
                                d="M11.122 5.10103C10.974 4.69825 10.6776 4.36734 10.2934 4.17619C9.90925 3.98504 9.46651 3.94812 9.05599 4.07303C7.10999 4.67303 5.74999 6.34303 6.04199 8.27503C6.37059 10.4188 7.09707 12.4822 8.18399 14.359C9.26091 16.2308 10.6731 17.8884 12.35 19.249C13.858 20.469 15.974 20.133 17.466 18.733C17.7798 18.4385 17.9703 18.0358 17.9988 17.6064C18.0274 17.1769 17.892 16.7526 17.62 16.419L16.552 15.113C16.3381 14.8504 16.0502 14.6581 15.7257 14.5611C15.4011 14.4641 15.0549 14.4669 14.732 14.569L12.268 15.349L11.838 14.905C11.2964 14.3429 10.8225 13.7193 10.426 13.047C10.042 12.3667 9.74241 11.642 9.53399 10.889L9.36799 10.299L11.268 8.54903C11.5194 8.31669 11.6957 8.01464 11.7745 7.6815C11.8532 7.34837 11.8308 6.99932 11.71 6.67903L11.122 5.10103ZM8.46799 2.16103C9.3663 1.88618 10.3357 1.96529 11.1776 2.38213C12.0194 2.79897 12.67 3.52199 12.996 4.40303L13.582 5.97903C13.8413 6.67131 13.8885 7.42515 13.7175 8.14436C13.5465 8.86357 13.1651 9.51552 12.622 10.017L11.642 10.919C11.768 11.267 11.938 11.665 12.158 12.051C12.378 12.431 12.634 12.777 12.868 13.059L14.128 12.659C14.8324 12.4366 15.5874 12.4308 16.2952 12.6422C17.003 12.8537 17.631 13.2727 18.098 13.845L19.166 15.151C19.7595 15.8768 20.0554 16.8009 19.9938 17.7365C19.9321 18.6721 19.5176 19.5493 18.834 20.191C16.846 22.057 13.6 22.831 11.094 20.803C9.22648 19.2883 7.65363 17.443 6.45399 15.359C5.24119 13.2658 4.43059 10.9643 4.06399 8.57303C3.58399 5.38703 5.86999 2.96103 8.46799 2.16303"
                                fill="currentColor"
                            />
                        </svg>

                        <div class="flex flex-col gap-2 flex-1 min-w-0">
                            <h2 id="stay-connected-title" class="text-h5 text-text-primary">Stay Connected</h2>
                            <p class="text-body-md text-text-secondary">
                                Our admin team will contact you through your registered phone number if further information or clarification regarding your report is needed.
                            </p>
                        </div>
                    </aside>
                </div>

                <section aria-labelledby="upload-photos-label" class="lg:col-span-5 flex flex-col gap-6">
                    <h2 id="upload-photos-label" class="text-body-lg text-text-primary">Upload Photos</h2>
                    <RoomImageUploader v-model="form.images" :error="errors.images" />
                </section>
            </div>

            <div class="mt-10 pt-8 border-t border-border-default flex flex-wrap items-center justify-end gap-4">
                <BaseButton variant="secondary" type="button" size="md" :disabled="isMutating" @click="goBack">Cancel</BaseButton>
                <BaseButton type="submit" variant="primary" size="md" :disabled="isSubmitDisabled">
                    {{ isMutating ? 'Submitting...' : 'Report an Issue' }}
                </BaseButton>
            </div>
        </form>
    </div>
</template>
