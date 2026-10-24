<script setup>
import { computed, onMounted } from 'vue';
import { useRoomMeta } from '@/composables/useRoomMeta';
import AppDropdown from '@/components/common/AppDropdown.vue';
import FacilityChipGroup from '@/components/rooms/FacilityChipGroup.vue';
import BaseButton from '@/components/common/BaseButton.vue';

defineProps({
    isFetching: {
        type: Boolean,
        default: false,
    },
});

const roomTypeFilter = defineModel('roomType', { default: '' });
const floorFilter = defineModel('floor', { default: '' });
const minPriceFilter = defineModel('minPrice', { default: '' });
const maxPriceFilter = defineModel('maxPrice', { default: '' });
const facilitiesFilter = defineModel('facilities', { default: () => [] });

const emit = defineEmits(['applyFilters', 'reset']);

const { roomTypes, floors, priceRanges, facilities, fetchRoomMeta } = useRoomMeta();

onMounted(() => {
    fetchRoomMeta();
});

const hasActiveFilters = computed(() => {
    return Boolean(roomTypeFilter.value || floorFilter.value || minPriceFilter.value || maxPriceFilter.value || facilitiesFilter.value.length > 0);
});

const priceRangeModel = computed({
    get() {
        const range = priceRanges.value.find(r => r.raw.min_price.toString() === minPriceFilter.value?.toString() && r.raw.max_price.toString() === maxPriceFilter.value?.toString());
        return range ? range.value : '';
    },
    set(val) {
        const range = priceRanges.value.find(r => r.value === val);
        if (range) {
            minPriceFilter.value = range.raw.min_price.toString();
            maxPriceFilter.value = range.raw.max_price.toString();
        } else {
            minPriceFilter.value = '';
            maxPriceFilter.value = '';
        }
    },
});
</script>

<template>
    <section aria-label="Room Search Filters" class="w-full">
        <form @submit.prevent="$emit('applyFilters')" class="w-full bg-neutral-100 rounded-xl px-6 md:px-8 py-6 md:py-5 flex flex-col gap-6" role="search">
            <div role="group" aria-labelledby="basic-filters-label" class="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <span id="basic-filters-label" class="sr-only">Basic Room Filters</span>
                <div class="flex flex-col gap-4">
                    <label for="filter-room-type" class="text-h5 text-text-primary">Type Room</label>
                    <AppDropdown id="filter-room-type" v-model="roomTypeFilter" :options="roomTypes" placeholder="All Room Types" size="md" />
                </div>

                <div class="flex flex-col gap-4">
                    <label for="filter-floor" class="text-h5 text-text-primary">Floor</label>
                    <AppDropdown id="filter-floor" v-model="floorFilter" :options="floors" placeholder="All Floors" size="md" />
                </div>

                <div class="flex flex-col gap-4">
                    <label for="filter-price" class="text-h5 text-text-primary">Price</label>
                    <AppDropdown id="filter-price" v-model="priceRangeModel" :options="priceRanges" placeholder="Any Price" size="md" />
                </div>
            </div>

            <div class="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 w-full">
                <div role="group" aria-labelledby="fasilitas-label" class="flex flex-col gap-4 flex-1 overflow-hidden">
                    <span id="fasilitas-label" class="text-h5 text-text-primary">Fasilitas</span>
                    <FacilityChipGroup :options="facilities" v-model="facilitiesFilter" />
                </div>

                <div class="flex items-center gap-3 shrink-0 w-full lg:w-auto justify-end mt-4 lg:mt-0">
                    <button
                        v-if="hasActiveFilters"
                        type="button"
                        @click="$emit('reset')"
                        class="text-label-btn-md text-text-secondary hover:text-text-primary focus-visible:outline-none rounded-xl px-2 py-1 transition-colors cursor-pointer"
                    >
                        Clear Filters
                    </button>
                    <BaseButton type="submit" variant="primary" size="md" :disabled="isFetching">
                        {{ isFetching ? 'Applying...' : 'Apply Filters' }}
                    </BaseButton>
                </div>
            </div>
        </form>
    </section>
</template>
