<script setup>
import { computed } from 'vue';
import AppDropdown from '@/components/common/AppDropdown.vue';

const roomTypeFilter = defineModel('roomType', { default: '' });
const floorFilter = defineModel('floor', { default: '' });
const minPriceFilter = defineModel('minPrice', { default: '' });
const maxPriceFilter = defineModel('maxPrice', { default: '' });
const statusFilter = defineModel('status', { default: '' });

const emit = defineEmits(['reset']);

const hasActiveFilters = computed(() => {
    return Boolean(roomTypeFilter.value || floorFilter.value || minPriceFilter.value || maxPriceFilter.value || statusFilter.value);
});

const priceRangeModel = computed({
    get() {
        if (minPriceFilter.value === '1200000' && maxPriceFilter.value === '1699999') return 'range1';
        if (minPriceFilter.value === '1700000' && maxPriceFilter.value === '2199999') return 'range2';
        if (minPriceFilter.value === '2200000' && maxPriceFilter.value === '2800000') return 'range3';
        return '';
    },
    set(val) {
        if (val === 'range1') {
            minPriceFilter.value = '1200000';
            maxPriceFilter.value = '1699999';
        } else if (val === 'range2') {
            minPriceFilter.value = '1700000';
            maxPriceFilter.value = '2199999';
        } else if (val === 'range3') {
            minPriceFilter.value = '2200000';
            maxPriceFilter.value = '2800000';
        } else {
            minPriceFilter.value = '';
            maxPriceFilter.value = '';
        }
    },
});

const priceOptions = [
    { label: 'Rp1.200.000 – Rp1.699.999', value: 'range1' },
    { label: 'Rp1.700.000 – Rp2.199.999', value: 'range2' },
    { label: 'Rp2.200.000 – Rp2.800.000', value: 'range3' },
];

const roomTypeOptions = [
    { label: 'Single Room', value: '1' },
    { label: 'Double Room', value: '2' },
    { label: 'Master Room', value: '3' },
];

const floorOptions = [
    { label: 'Floor 1', value: '1' },
    { label: 'Floor 2', value: '2' },
    { label: 'Floor 3', value: '3' },
];

const statusOptions = [
    { label: 'Available', value: 'available' },
    { label: 'Occupied', value: 'occupied' },
];
</script>

<template>
    <div class="flex items-center justify-between gap-4 select-none w-full">
        <div class="flex items-center gap-3 flex-wrap">
            <div class="w-52">
                <AppDropdown v-model="priceRangeModel" :options="priceOptions" placeholder="Any Price" size="sm" />
            </div>
            <div class="w-44">
                <AppDropdown v-model="roomTypeFilter" :options="roomTypeOptions" placeholder="All Room Types" size="sm" />
            </div>
            <div class="w-36">
                <AppDropdown v-model="floorFilter" :options="floorOptions" placeholder="All Floors" size="sm" />
            </div>
            <div class="w-40">
                <AppDropdown v-model="statusFilter" :options="statusOptions" placeholder="All Statuses" size="sm" />
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
