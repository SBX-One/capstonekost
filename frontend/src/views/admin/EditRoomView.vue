<script setup>
import { ref, reactive, watch, nextTick, onMounted, computed } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import isEqual from 'lodash/isEqual';

import { useRoom } from '@/composables/useRoom';
import { useRoomValidation } from '@/composables/useRoomValidation';
import { useRoomFacilities } from '@/composables/useRoomFacilities';
import { sanitizeRoomPayload } from '@/utils/sanitizers';

import AppDropdown from '@/components/common/AppDropdown.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import FacilityChipGroup from '@/components/rooms/FacilityChipGroup.vue';
import RoomImageUploader from '@/components/rooms/RoomImageUploader.vue';

const props = defineProps({
    id: { type: [String, Number], required: true },
});

const router = useRouter();
const { fetchRoomById, updateRoom, isMutating, isFetching, formatRupiah } = useRoom();
const { validateAll, validateField, errors, setFieldError } = useRoomValidation(true);
const { facilityOptions } = useRoomFacilities();

const form = reactive({
    name: '',
    room_type: '',
    floor: '',
    price: '',
    facilities: [],
    overview: '',
    description: '',
    rules: '',
    images: [null, null, null, null, null],
});

const originalForm = ref(null);
const isFormDirty = ref(false);
const displayPrice = ref('');
const dbImages = ref([]);
const deletedImageIds = ref([]);

const checkFormChanged = () => {
    if (!originalForm.value) return false;

    const currentCompare = {
        ...form,
        facilities: [...form.facilities].sort(),
    };

    const originalCompare = {
        ...originalForm.value,
        facilities: [...originalForm.value.facilities].sort(),
    };

    const isFormModified = !isEqual(currentCompare, originalCompare);
    const isImagesDeleted = deletedImageIds.value.length > 0;

    return isFormModified || isImagesDeleted;
};

const isSubmitDisabled = computed(() => {
    return isMutating.value || !isFormDirty.value;
});

const loadExistingRoomData = async () => {
    const data = await fetchRoomById(props.id);

    if (data) {
        form.name = data.name;
        form.room_type = data.room_type?.id || data.room_type;
        form.floor = data.floor;
        form.price = data.price;

        if (data.price) displayPrice.value = formatRupiah(data.price).replace(/Rp\s?/g, '').trim();

        form.overview = data.overview || '';
        form.description = data.description || '';
        form.rules = data.rules || '';

        if (Array.isArray(data.facilities)) {
            form.facilities = data.facilities.map(fac => fac.id);
        }

        if (Array.isArray(data.image_paths)) {
            dbImages.value = data.image_paths;
        }

        originalForm.value = JSON.parse(JSON.stringify(form));

        nextTick(() => {
            isFormDirty.value = false;
        });
    } else {
        router.push({ name: 'admin-rooms' });
    }
};

onMounted(() => {
    loadExistingRoomData();
});

watch(
    form,
    () => {
        isFormDirty.value = checkFormChanged();
    },
    { deep: true }
);

onBeforeRouteLeave((to, from, next) => {
    if (isFormDirty.value) {
        const answer = window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
        answer ? next() : next(false);
    } else {
        next();
    }
});

watch(
    () => form.images,
    newImages => {
        validateField('images', newImages);
    },
    { deep: true }
);

const handleRemoveExistingImage = imageId => {
    if (imageId && !deletedImageIds.value.includes(imageId)) {
        deletedImageIds.value.push(imageId);
        isFormDirty.value = checkFormChanged();
    }
};

const handlePriceInput = event => {
    setFieldError('price', '');
    const numericValue = event.target.value.replace(/[^0-9]/g, '');
    form.price = numericValue ? Number(numericValue) : '';
    displayPrice.value = numericValue ? formatRupiah(Number(numericValue)).replace(/Rp\s?/g, '').trim() : '';
};

const adjustPrice = amount => {
    const newPrice = (form.price ? Number(form.price) : 0) + amount;
    if (newPrice <= 0) {
        form.price = '';
        displayPrice.value = '';
    } else {
        form.price = newPrice;
        displayPrice.value = formatRupiah(newPrice).replace(/Rp\s?/g, '').trim();
    }
    validateField('price', form.price);
};

const roomTypeOptions = [
    { label: 'Single Room', value: 1 },
    { label: 'Double Room', value: 2 },
    { label: 'Master Room', value: 3 },
];
const floorOptions = [
    { label: 'Floor 1', value: 1 },
    { label: 'Floor 2', value: 2 },
    { label: 'Floor 3', value: 3 },
];

const submitForm = async () => {
    if (!validateAll(form)) return;

    const hasExistingPrimary = dbImages.value.length > 0 && !deletedImageIds.value.includes(dbImages.value[0].id);
    const hasNewPrimary = form.images[0] !== null;

    if (!hasExistingPrimary && !hasNewPrimary) {
        setFieldError('images', 'Primary Room Image is required. You cannot delete all photos.');
        return;
    }

    const cleanData = sanitizeRoomPayload(form);
    const formData = new FormData();

    formData.append('_method', 'PATCH');

    Object.entries(cleanData).forEach(([key, value]) => {
        if (key !== 'facilities' && key !== 'images' && value !== null && value !== undefined && value !== '') {
            formData.append(key, value);
        }
    });

    if (Array.isArray(cleanData.facilities)) {
        cleanData.facilities.forEach(id => formData.append('facilities[]', id));
    }

    if (deletedImageIds.value.length > 0) {
        deletedImageIds.value.forEach(id => formData.append('deleted_images[]', id));
    }

    form.images.forEach((file, index) => {
        if (file) formData.append(`images[${index}]`, file);
    });

    const success = await updateRoom(props.id, formData);
    if (success) {
        isFormDirty.value = false;
        await nextTick();
        router.push({ name: 'admin-rooms' });
    }
};
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen">
        <div class="flex flex-col gap-1 mb-16">
            <h1 class="text-h2 text-text-primary tracking-tight">Edit Room</h1>
            <p class="text-body-lg text-text-secondary">Update room details, facilities, pricing, and photos.</p>
        </div>

        <div v-if="isFetching" class="flex justify-center items-center h-64">
            <p class="text-body-lg text-text-secondary">Loading room data...</p>
        </div>

        <form v-else @submit.prevent="submitForm">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-800">
                <div class="lg:col-span-7 flex flex-col gap-500">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-400">
                        <BaseInput
                            v-model="form.name"
                            label="Room Name"
                            placeholder="e.g Room A-01"
                            variant="secondary"
                            :error="errors.name"
                            @update:modelValue="setFieldError('name', '')"
                            @blur="validateField('name', form.name)"
                        />
                        <div class="flex flex-col gap-200 w-full">
                            <label class="text-body-lg text-text-primary">Room Type</label>
                            <AppDropdown
                                v-model="form.room_type"
                                :options="roomTypeOptions"
                                placeholder="Select Room Type"
                                @update:modelValue="setFieldError('room_type', '')"
                                @blur="validateField('room_type', form.room_type)"
                            />
                            <p v-if="errors.room_type" class="text-body-sm text-status-error">{{ errors.room_type }}</p>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-400">
                        <div class="flex flex-col gap-200 w-full">
                            <label class="text-body-lg text-text-primary">Floor</label>
                            <AppDropdown
                                v-model="form.floor"
                                :options="floorOptions"
                                placeholder="Select Floor"
                                @update:modelValue="setFieldError('floor', '')"
                                @blur="validateField('floor', form.floor)"
                            />
                            <p v-if="errors.floor" class="text-body-sm text-status-error">{{ errors.floor }}</p>
                        </div>

                        <div class="flex flex-col gap-200 w-full relative">
                            <BaseInput
                                v-model="displayPrice"
                                type="text"
                                inputmode="numeric"
                                pattern="[0-9]*"
                                label="Price"
                                placeholder="1.500.000"
                                variant="secondary"
                                :error="errors.price"
                                @input="handlePriceInput"
                                @blur="validateField('price', form.price)"
                            >
                                <template #prefix>
                                    <span>Rp</span>
                                </template>

                                <template #icon-right>
                                    <div class="pointer-events-auto flex items-center bg-surface-default border border-border-default rounded overflow-hidden h-7 mr-1 select-none">
                                        <button
                                            type="button"
                                            :disabled="!form.price || form.price <= 0"
                                            @click.stop="adjustPrice(-50000)"
                                            class="w-8 h-full flex items-center justify-center transition-colors focus:outline-none"
                                            :class="
                                                !form.price || form.price <= 0
                                                    ? 'text-neutral-300 cursor-not-allowed bg-neutral-50'
                                                    : 'text-text-secondary hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer'
                                            "
                                            aria-label="Decrease price by 50.000"
                                        >
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4" />
                                            </svg>
                                        </button>

                                        <div class="w-px h-3.5 bg-border-default"></div>

                                        <button
                                            type="button"
                                            @click.stop="adjustPrice(50000)"
                                            class="w-8 h-full flex items-center justify-center text-text-secondary hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-none cursor-pointer"
                                            aria-label="Increase price by 50.000"
                                        >
                                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </template>
                            </BaseInput>
                        </div>
                    </div>

                    <div class="flex flex-col gap-200 w-full">
                        <label class="text-body-lg text-text-primary">Facilities</label>
                        <FacilityChipGroup v-model="form.facilities" :options="facilityOptions" @update:modelValue="validateField('facilities', form.facilities)" />
                        <p v-if="errors.facilities" class="text-body-sm text-status-error">{{ errors.facilities }}</p>
                    </div>

                    <BaseInput
                        v-model="form.overview"
                        type="textarea"
                        label="Overview"
                        placeholder="Write a short summary of the room..."
                        variant="secondary"
                        :rows="3"
                        :error="errors.overview"
                        @update:modelValue="setFieldError('overview', '')"
                        @blur="validateField('overview', form.overview)"
                    />

                    <BaseInput
                        v-model="form.description"
                        type="textarea"
                        label="Description"
                        placeholder="Describe the rooms, its features, and any other important details..."
                        variant="secondary"
                        :rows="5"
                        :error="errors.description"
                        @update:modelValue="setFieldError('description', '')"
                        @blur="validateField('description', form.description)"
                    />

                    <BaseInput
                        v-model="form.rules"
                        type="textarea"
                        label="Rules"
                        placeholder="Write down the room rules or guidelines..."
                        variant="secondary"
                        :rows="4"
                        :error="errors.rules"
                        @update:modelValue="setFieldError('rules', '')"
                        @blur="validateField('rules', form.rules)"
                    />
                </div>

                <div class="lg:col-span-5 flex flex-col">
                    <RoomImageUploader v-model="form.images" :existing-images="dbImages" :error="errors.images" @remove-existing="handleRemoveExistingImage" />
                </div>
            </div>

            <div class="mt-600 pt-500 border-t border-border-default flex justify-end gap-300">
                <BaseButton variant="secondary" type="button" size="lg" @click="router.back()">Cancel</BaseButton>
                <BaseButton type="submit" variant="primary" size="lg" :disabled="isSubmitDisabled">
                    {{ isMutating ? 'Saving...' : 'Save Changes' }}
                </BaseButton>
            </div>
        </form>
    </div>
</template>
