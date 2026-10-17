<script setup>
import { ref } from 'vue';
import AddFacilityModal from '@/components/rooms/AddFacilityModal.vue';
import FacilityIcon from '@/components/rooms/FacilityIcon.vue';

const props = defineProps({
    options: {
        type: Array,
        required: true,
    },
    showAddButton: {
        type: Boolean,
        default: false,
    },
});

const modelValue = defineModel({
    type: Array,
    default: () => [],
});

const emit = defineEmits(['create-new']);
const isModalOpen = ref(false);

const toggleFacility = id => {
    const selectionSet = new Set(modelValue.value);

    if (selectionSet.has(id)) {
        selectionSet.delete(id);
    } else {
        selectionSet.add(id);
    }

    modelValue.value = Array.from(selectionSet);
};

const handleAddNewFacility = facilityPayload => {
    emit('create-new', facilityPayload);
};
</script>

<template>
    <div class="w-full">
        <div class="flex flex-wrap gap-200">
            <button
                v-for="fac in options"
                :key="fac.id"
                type="button"
                @click="toggleFacility(fac.id)"
                class="px-4 py-2 rounded-full border text-label-btn-md transition-colors duration-200 flex items-center gap-2 cursor-pointer focus:outline-none"
                :class="
                    modelValue.includes(fac.id) ? 'border-neutral-900 bg-neutral-900 text-text-inverse font-semibold' : 'border-border-default bg-transparent text-text-primary hover:bg-neutral-100'
                "
            >
                <FacilityIcon :name="fac.icon_name || fac.label" class="w-4 h-4" />
                <span>{{ fac.label }}</span>
            </button>

            <button
                v-if="showAddButton"
                type="button"
                @click="isModalOpen = true"
                class="px-4 py-2 rounded-full border text-label-btn-md border-dashed border-border-default bg-neutral-50 text-text-secondary hover:text-text-primary hover:border-neutral-600 transition-colors duration-200 flex items-center gap-2 cursor-pointer focus:outline-none"
            >
                <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>
                </svg>
                <span>Add Facility</span>
            </button>
        </div>

        <AddFacilityModal :is-open="isModalOpen" @close="isModalOpen = false" @add-facility="handleAddNewFacility" />
    </div>
</template>
