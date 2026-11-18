<script setup>
import { ref, reactive, computed, watch, nextTick, onBeforeUpdate } from 'vue';
import { useFacilityValidation } from '@/composables/useFacilityValidation';
import { sanitizeFacilityPayload } from '@/utils/sanitizers';

import AppModal from '@/components/common/AppModal.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import FacilityIcon from '@/components/rooms/FacilityIcon.vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close', 'submit']);

const { errors, validateField, validateAll, clearErrors } = useFacilityValidation();

const availableIcons = [
    'Home',
    'AirConditioner',
    'Bed',
    'Shower',
    'Wifi',
    'Table',
    'Monitor',
    'Fan',
    'Sofa',
    'Refrigerator',
    'Glass',
    'Camera',
    'Hanger',
    'Dumbbell',
    'Door',
    'Microwave',
    'Cup',
    'Wardrobe',
    'Chair',
    'Bath',
    'Lamp',
];

const form = reactive({
    name: '',
    information: '',
    icon_name: 'Home',
});

const searchQuery = ref('');
const isSubmitting = ref(false);

const filteredIcons = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    if (!query) return availableIcons;
    return availableIcons.filter(icon => icon.toLowerCase().includes(query));
});

const selectIcon = iconName => {
    form.icon_name = iconName;
    validateField('icon_name', form.icon_name);
};

const clearSearch = () => {
    searchQuery.value = '';
};

const iconRefs = ref([]);

onBeforeUpdate(() => {
    iconRefs.value = [];
});

const handleIconKeydown = (event, index, iconName) => {
    if (!filteredIcons.value || filteredIcons.value.length === 0) return;

    if ([' ', 'Enter'].includes(event.key)) {
        event.preventDefault();
        selectIcon(iconName);
        return;
    }

    const maxIndex = filteredIcons.value.length - 1;
    let nextIndex = index;
    let shouldMoveFocus = false;

    if (['ArrowRight', 'ArrowDown'].includes(event.key)) {
        event.preventDefault();
        nextIndex = index >= maxIndex ? 0 : index + 1;
        shouldMoveFocus = true;
    } else if (['ArrowLeft', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
        nextIndex = index <= 0 ? maxIndex : index - 1;
        shouldMoveFocus = true;
    }

    if (shouldMoveFocus) {
        nextTick(() => {
            const targetEl = iconRefs.value[nextIndex];
            if (targetEl && typeof targetEl.focus === 'function') {
                targetEl.focus();

                const nextIconName = filteredIcons.value[nextIndex];
                if (nextIconName) {
                    selectIcon(nextIconName);
                }
            }
        });
    }
};

const handleSearchKeydown = event => {
    if (event.key === 'Escape' && searchQuery.value) {
        event.stopPropagation();
        clearSearch();
    }
};

const closeModal = () => {
    if (isSubmitting.value) return;
    emit('close');
};

watch(
    () => props.isOpen,
    newVal => {
        if (!newVal) {
            form.name = '';
            form.information = '';
            form.icon_name = 'Home';
            searchQuery.value = '';
            clearErrors();
        }
    }
);

const handleSubmit = async () => {
    if (!validateAll(form)) return;

    isSubmitting.value = true;
    try {
        const payload = sanitizeFacilityPayload(form);
        await emit('submit', payload);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <AppModal :isOpen="isOpen" maxWidth="max-w-md" :persistent="isSubmitting" :hideCloseButton="isSubmitting" @close="closeModal">
        <form @submit.prevent="handleSubmit" class="flex flex-col p-6 sm:p-8 gap-6 w-full max-w-md bg-bg-default mx-auto" aria-labelledby="modal-add-facility-title">
            <h2 id="modal-add-facility-title" class="text-h4 text-text-primary pr-8">Add Facilities</h2>

            <div class="flex flex-col gap-4">
                <BaseInput id="facility-name" v-model="form.name" label="Facility Name" placeholder="e.g. Gym" :error="errors.name" :disabled="isSubmitting" @blur="validateField('name', form.name)" />
                <BaseInput
                    id="facility-information"
                    v-model="form.information"
                    label="Facility Information"
                    placeholder="e.g. Private in-room gym"
                    :error="errors.information"
                    :disabled="isSubmitting"
                    @blur="validateField('information', form.information)"
                />
            </div>

            <div class="flex flex-col gap-4">
                <BaseInput id="search-icon" v-model="searchQuery" label="Facility Icon" placeholder="Search icon" :disabled="isSubmitting" @keydown="handleSearchKeydown">
                    <template #icon-left>
                        <svg class="w-6 h-6 text-text-secondary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path
                                d="M21 21L16.514 16.506M19 10.5C19 12.7543 18.1045 14.9163 16.5104 16.5104C14.9163 18.1045 12.7543 19 10.5 19C8.24566 19 6.08365 18.1045 4.48959 16.5104C2.89553 14.9163 2 12.7543 2 10.5C2 8.24566 2.89553 6.08365 4.48959 4.48959C6.08365 2.89553 8.24566 2 10.5 2C12.7543 2 14.9163 2.89553 16.5104 4.48959C18.1045 6.08365 19 8.24566 19 10.5Z"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke="currentColor"
                            />
                        </svg>
                    </template>
                    <template #icon-right v-if="searchQuery">
                        <button type="button" @click="clearSearch" class="text-text-secondary hover:text-text-primary focus:outline-none" aria-label="Clear search">
                            <svg class="w-3 h-3" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path d="M0.600586 0.601562L12.6006 12.6016" stroke-width="1.7" stroke="currentColor" />
                                <path d="M12.6006 0.601562L0.600586 12.6016" stroke-width="1.7" stroke="currentColor" />
                            </svg>
                        </button>
                    </template>
                </BaseInput>

                <div
                    v-if="filteredIcons.length > 0"
                    role="radiogroup"
                    aria-labelledby="icon-group-label"
                    class="grid grid-cols-5 sm:grid-cols-7 gap-3 overflow-y-auto max-h-56 custom-scrollbar"
                    :class="{ 'opacity-60 pointer-events-none': isSubmitting }"
                >
                    <button
                        v-for="(icon, index) in filteredIcons"
                        :key="icon"
                        :ref="
                            el => {
                                if (el) iconRefs[index] = el;
                            }
                        "
                        type="button"
                        role="radio"
                        :aria-checked="form.icon_name === icon"
                        :tabindex="form.icon_name === icon || (index === 0 && !filteredIcons.includes(form.icon_name)) ? 0 : -1"
                        :disabled="isSubmitting"
                        @click="selectIcon(icon)"
                        @keydown="e => handleIconKeydown(e, index, icon)"
                        class="flex items-center justify-center aspect-square rounded-default border transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                        :class="[
                            form.icon_name === icon ? 'bg-neutral-900 border-neutral-900 text-neutral-50' : 'bg-neutral-50 border-border-default text-text-primary hover:bg-neutral-200',
                            isSubmitting ? 'cursor-not-allowed' : '',
                        ]"
                        :title="icon"
                        :aria-label="icon"
                    >
                        <FacilityIcon :name="icon" class="w-6 h-6" aria-hidden="true" />
                    </button>
                </div>

                <div v-else class="flex flex-col items-center justify-center py-6 px-4 gap-3 bg-neutral-100 rounded-default text-center" role="status" aria-live="polite">
                    <svg class="w-6 h-6 text-text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path
                            d="M16.9922 17L20.9922 21M7.99219 8L10.9922 11M10.9922 11L13.9922 14M10.9922 11L13.9922 8M10.9922 11L7.99219 14M18.9922 11C18.9922 8.87827 18.1493 6.84344 16.649 5.34315C15.1487 3.84285 13.1139 3 10.9922 3C8.87045 3 6.83562 3.84285 5.33533 5.34315C3.83504 6.84344 2.99219 8.87827 2.99219 11C2.99219 13.1217 3.83504 15.1566 5.33533 16.6569C6.83562 18.1571 8.87045 19 10.9922 19C13.1139 19 15.1487 18.1571 16.649 16.6569C18.1493 15.1566 18.9922 13.1217 18.9922 11Z"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke="currentColor"
                        />
                    </svg>

                    <div class="flex flex-col gap-1">
                        <span class="text-label-btn-md font-semibold text-text-primary">No matching icons</span>
                        <span class="text-body-sm text-text-secondary leading-relaxed">You can still add this facility using the default house icon.</span>
                    </div>
                    <BaseButton variant="secondary" size="sm" type="button" @click="clearSearch" class="mt-2"> Clear Search </BaseButton>
                </div>

                <div class="flex flex-col gap-2 p-3 bg-neutral-100 rounded-default">
                    <div class="flex items-center gap-2">
                        <svg class="w-4 h-4 text-text-primary shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path
                                d="M8.5 11V7H6.5V8H7.5V11H6V12H10V11H8.5ZM8 4C7.85166 4 7.70666 4.04399 7.58332 4.1264C7.45999 4.20881 7.36386 4.32594 7.30709 4.46299C7.25032 4.60003 7.23547 4.75083 7.26441 4.89632C7.29335 5.0418 7.36478 5.17544 7.46967 5.28033C7.57456 5.38522 7.7082 5.45665 7.85368 5.48559C7.99917 5.51453 8.14997 5.49968 8.28701 5.44291C8.42406 5.38614 8.54119 5.29001 8.6236 5.16668C8.70601 5.04334 8.75 4.89834 8.75 4.75C8.75 4.55109 8.67098 4.36032 8.53033 4.21967C8.38968 4.07902 8.19891 4 8 4Z"
                                fill="currentColor"
                            />
                            <path
                                d="M8 15C6.61553 15 5.26216 14.5895 4.11101 13.8203C2.95987 13.0511 2.06266 11.9579 1.53285 10.6788C1.00303 9.3997 0.86441 7.99224 1.13451 6.63437C1.4046 5.2765 2.07129 4.02922 3.05026 3.05026C4.02922 2.07129 5.2765 1.4046 6.63437 1.13451C7.99224 0.86441 9.3997 1.00303 10.6788 1.53285C11.9579 2.06266 13.0511 2.95987 13.8203 4.11101C14.5895 5.26216 15 6.61553 15 8C15 9.85652 14.2625 11.637 12.9497 12.9497C11.637 14.2625 9.85652 15 8 15ZM8 2C6.81332 2 5.65328 2.3519 4.66658 3.01119C3.67989 3.67047 2.91085 4.60755 2.45673 5.7039C2.0026 6.80026 1.88378 8.00666 2.11529 9.17054C2.3468 10.3344 2.91825 11.4035 3.75736 12.2426C4.59648 13.0818 5.66558 13.6532 6.82946 13.8847C7.99335 14.1162 9.19975 13.9974 10.2961 13.5433C11.3925 13.0892 12.3295 12.3201 12.9888 11.3334C13.6481 10.3467 14 9.18669 14 8C14 6.4087 13.3679 4.88258 12.2426 3.75736C11.1174 2.63214 9.5913 2 8 2Z"
                                fill="currentColor"
                            />
                        </svg>

                        <span class="text-body-sm text-text-primary">No suitable icon?</span>
                    </div>
                    <span class="text-body-sm text-text-secondary leading-relaxed">You can save the facility without selecting an icon. The default house icon will be used</span>
                </div>
            </div>

            <div class="flex flex-col gap-4 mt-2">
                <div class="flex items-center gap-2">
                    <span class="text-body-sm text-text-secondary">Selected icon:</span>
                    <div class="flex items-center gap-1 text-body-sm text-text-primary" aria-live="polite">
                        <FacilityIcon :name="form.icon_name" class="w-4 h-4" aria-hidden="true" />
                        <span>{{ form.icon_name }}</span>
                    </div>
                </div>

                <hr class="border-t border-border-default m-0" />

                <div class="flex justify-end gap-2">
                    <BaseButton variant="secondary" size="sm" type="button" @click="closeModal" :disabled="isSubmitting"> Cancel </BaseButton>
                    <BaseButton variant="primary" size="sm" type="submit" :disabled="isSubmitting" :loading="isSubmitting">
                        <template #icon-left>
                            <svg v-if="!isSubmitting" class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 12H12M12 12H18M12 12V18M12 12V6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" />
                            </svg>
                        </template>
                        {{ isSubmitting ? 'Saving...' : 'Add Facility' }}
                    </BaseButton>
                </div>
            </div>
        </form>
    </AppModal>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: var(--color-border-default, #c5c5ce);
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-neutral-500, #9b9ba6);
}
</style>
