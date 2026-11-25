<script setup>
import FacilityIcon from '@/components/rooms/FacilityIcon.vue';

const props = defineProps({
    options: {
        type: Array,
        required: true,
    },
});

const modelValue = defineModel({
    type: Array,
    default: () => [],
});

const emit = defineEmits(['add-new']);

const toggleFacility = id => {
    const selectionSet = new Set(modelValue.value);

    if (selectionSet.has(id)) {
        selectionSet.delete(id);
    } else {
        selectionSet.add(id);
    }

    modelValue.value = Array.from(selectionSet);
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
                <FacilityIcon :name="fac.icon_name || fac.name" class="w-4 h-4" />
                <span>{{ fac.name }}</span>
            </button>

            <button
                type="button"
                @click="emit('add-new')"
                class="px-4 py-2 rounded-full border border-dashed border-border-default bg-surface-default text-label-btn-md text-text-secondary hover:text-action-primary hover:border-action-primary hover:bg-neutral-50 transition-colors duration-200 flex items-center gap-2 cursor-pointer focus:outline-none"
            >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 12H12M12 12H18M12 12V18M12 12V6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" />
                </svg>
                <span>Add Facility</span>
            </button>
        </div>
    </div>
</template>
