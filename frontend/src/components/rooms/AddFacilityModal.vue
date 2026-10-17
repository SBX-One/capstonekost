<script setup>
import { ref, computed, watch } from 'vue';
import { sanitizeText } from '@/utils/sanitizers';
import * as LucideIcons from 'lucide-vue-next';

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

const emit = defineEmits(['close', 'add-facility']);

const facilityLabel = ref('');
const iconSearchQuery = ref('');
const selectedIcon = ref('');

const allAvailableIcons = Object.keys(LucideIcons).filter(key => /^[A-Z]/.test(key));

const iconSuggestions = computed(() => {
    if (!iconSearchQuery.value || selectedIcon.value === iconSearchQuery.value) return [];

    const query = iconSearchQuery.value.toLowerCase().replace(/[^a-z0-9]/g, '');

    return allAvailableIcons.filter(icon => icon.toLowerCase().includes(query)).slice(0, 8);
});

const selectIcon = iconName => {
    selectedIcon.value = iconName;
    iconSearchQuery.value = iconName.replace(/([A-Z])/g, ' $1').trim();
};

watch(iconSearchQuery, (newVal, oldVal) => {
    if (!newVal) {
        selectedIcon.value = '';
    } else if (selectedIcon.value && newVal !== selectedIcon.value.replace(/([A-Z])/g, ' $1').trim()) {
        selectedIcon.value = '';
    }
});

const formatFacilityLabel = () => {
    if (!facilityLabel.value) return;

    const acronyms = ['AC', 'TV', 'WIFI', 'CCTV'];

    facilityLabel.value = facilityLabel.value
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => {
            const upperWord = word.toUpperCase();

            if (acronyms.includes(upperWord)) {
                if (upperWord === 'WIFI') return 'WiFi';
                return upperWord;
            }

            const lowerWord = word.toLowerCase();
            return lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
        })
        .join(' ');
};

const handleClose = () => {
    facilityLabel.value = '';
    iconSearchQuery.value = '';
    selectedIcon.value = '';
    emit('close');
};

const handleSubmit = () => {
    if (!facilityLabel.value || !selectedIcon.value) return;

    formatFacilityLabel();
    const cleanFacilityName = sanitizeText(facilityLabel.value);

    emit('add-facility', {
        label: cleanFacilityName,
        icon_name: selectedIcon.value,
    });

    handleClose();
};
</script>

<template>
    <AppModal :is-open="isOpen" @close="handleClose">
        <div class="mb-400">
            <h3 class="text-h4 text-text-primary">Add Facilities</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-400">
            <BaseInput v-model="facilityLabel" label="Facility Label (Display Name)" placeholder="e.g. Luxury Swimming Pool, Private Gym" :required="true" @blur="formatFacilityLabel" />

            <div class="flex flex-col gap-200">
                <BaseInput
                    v-model="iconSearchQuery"
                    label="Search Icon"
                    placeholder="Search icon in English... (e.g. pool, dumbbell, wifi)"
                    :required="true"
                    :error="iconSearchQuery && !selectedIcon && iconSuggestions.length === 0 ? 'Icon not found. Try different keywords (e.g., tv, bath, bed).' : ''"
                >
                    <template #icon-left>
                        <FacilityIcon :name="selectedIcon || 'Search'" class="w-5 h-5 transition-colors duration-300" :class="selectedIcon ? 'text-text-primary' : 'text-text-disabled'" />
                    </template>
                </BaseInput>

                <div v-if="iconSuggestions.length > 0 && !selectedIcon" class="mt-2 p-3 bg-neutral-50 border border-border-default rounded-default">
                    <p class="text-body-sm text-text-secondary mb-2 font-medium">Click to select an icon:</p>
                    <div class="flex flex-wrap gap-2">
                        <button
                            v-for="icon in iconSuggestions"
                            :key="icon"
                            type="button"
                            @click="selectIcon(icon)"
                            class="flex items-center gap-2 px-3 py-1.5 bg-bg-default border border-border-default rounded-full hover:bg-neutral-100 hover:border-neutral-300 transition-colors cursor-pointer"
                        >
                            <component :is="LucideIcons[icon]" class="w-4 h-4 text-text-secondary" stroke-width="2" />
                            <span class="text-body-sm text-text-primary font-medium">{{ icon.replace(/([A-Z])/g, ' $1').trim() }}</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="flex justify-end gap-300 mt-200">
                <BaseButton type="button" variant="secondary" @click="handleClose"> Cancel </BaseButton>
                <BaseButton type="submit" variant="primary" :disabled="!facilityLabel || !selectedIcon"> Add Facility </BaseButton>
            </div>
        </form>
    </AppModal>
</template>
