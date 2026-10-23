<script setup>
import { ref, reactive, watch, nextTick, computed } from 'vue';
import { useRouter, onBeforeRouteLeave } from 'vue-router';
import { useRoom } from '@/composables/useRoom';
import { useRoomValidation } from '@/composables/useRoomValidation';
import { useRoomFacilities } from '@/composables/useRoomFacilities';
import { sanitizeRoomPayload } from '@/utils/sanitizers';

import AppDropdown from '@/components/common/AppDropdown.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import FacilityChipGroup from '@/components/rooms/FacilityChipGroup.vue';
import RoomImageUploader from '@/components/rooms/RoomImageUploader.vue';

const router = useRouter();
const { createRoom, isMutating, formatRupiah } = useRoom();
const { validateAll, validateField, errors, setFieldError } = useRoomValidation();
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
    images: [null, null, null, null],
});

const isFormDirty = ref(false);
const displayPrice = ref('');

const isSubmitDisabled = computed(() => {
    return isMutating.value || !isFormDirty.value;
});

watch(
    form,
    () => {
        isFormDirty.value = true;
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

    const cleanData = sanitizeRoomPayload(form);
    const formData = new FormData();

    Object.entries(cleanData).forEach(([key, value]) => {
        if (key !== 'facilities' && key !== 'images' && value !== null && value !== undefined && value !== '') {
            formData.append(key, value);
        }
    });

    if (Array.isArray(cleanData.facilities)) {
        cleanData.facilities.forEach(id => formData.append('facilities[]', id));
    }

    form.images.forEach((file, index) => {
        if (file) formData.append(`images[${index}]`, file);
    });

    const success = await createRoom(formData);
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
            <h1 class="text-h2 text-text-primary tracking-tight">Add Room</h1>
            <p class="text-body-lg text-text-secondary">Add room details, facilities, pricing, and photos before making it available.</p>
        </div>

        <form @submit.prevent="submitForm">
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
                    <RoomImageUploader v-model="form.images" :error="errors.images" />
                </div>
            </div>

            <div class="mt-600 pt-500 border-t border-border-default flex justify-end gap-300">
                <BaseButton variant="secondary" type="button" size="lg" @click="router.back()">Cancel</BaseButton>
                <BaseButton type="submit" variant="primary" size="lg" :disabled="isSubmitDisabled">
                    {{ isMutating ? 'Saving...' : 'Add Room' }}
                </BaseButton>
            </div>
        </form>
    </div>
</template>
