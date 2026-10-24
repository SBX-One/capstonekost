<script setup>
import { computed, onMounted } from 'vue';
import { useRoomMeta } from '@/composables/useRoomMeta';
import AppDropdown from '@/components/common/AppDropdown.vue';

const roomTypeFilter = defineModel('roomType', { default: '' });
const floorFilter = defineModel('floor', { default: '' });
const minPriceFilter = defineModel('minPrice', { default: '' });
const maxPriceFilter = defineModel('maxPrice', { default: '' });
const statusFilter = defineModel('status', { default: '' });

const emit = defineEmits(['reset']);

const { roomTypes, floors, priceRanges, statuses, fetchRoomMeta } = useRoomMeta();

onMounted(() => {
    fetchRoomMeta();
});

const hasActiveFilters = computed(() => {
    return Boolean(roomTypeFilter.value || floorFilter.value || minPriceFilter.value || maxPriceFilter.value || statusFilter.value);
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
    <div class="flex items-center justify-between gap-4 select-none w-full">
        <div class="flex items-center gap-3 flex-wrap">
            <div class="w-52">
                <AppDropdown v-model="priceRangeModel" :options="priceRanges" placeholder="Any Price" size="sm" />
            </div>
            <div class="w-44">
                <AppDropdown v-model="roomTypeFilter" :options="roomTypes" placeholder="All Room Types" size="sm" />
            </div>
            <div class="w-36">
                <AppDropdown v-model="floorFilter" :options="floors" placeholder="All Floors" size="sm" />
            </div>
            <div class="w-40">
                <AppDropdown v-model="statusFilter" :options="statuses" placeholder="All Statuses" size="sm" />
            </div>
        </div>

        <div class="min-w-22.5 text-right">
            <button
                v-if="hasActiveFilters"
                type="button"
                @click="$emit('reset')"
                class="text-body-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer px-2 py-1"
            >
                Clear Filters
            </button>
        </div>
    </div>
</template>
