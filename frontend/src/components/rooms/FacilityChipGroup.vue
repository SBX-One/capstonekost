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
                <FacilityIcon :name="fac.name" class="w-4 h-4" />
                <span>{{ fac.name }}</span>
            </button>
        </div>
    </div>
</template>
