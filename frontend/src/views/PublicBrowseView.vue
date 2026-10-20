<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import BrowseHeroSection from '@/components/landing/BrowseHeroSection.vue';
import BrowseFilterSection from '@/components/landing/BrowseFilterSection.vue';
import RoomCard from '@/components/rooms/RoomCard.vue';
import RoomCardSkeleton from '@/components/rooms/RoomCardSkeleton.vue';
import AppPagination from '@/components/common/AppPagination.vue';
import BaseButton from '@/components/common/BaseButton.vue';

import { useTenantRoom } from '@/composables/useTenantRoom';
import { useRoomFilter } from '@/composables/useRoomFilter';
import { usePagination } from '@/composables/usePagination';

function scrollAfterPagination() {
    const scrollContainer = document.querySelector('main') || document.querySelector('.overflow-y-auto') || document.documentElement;
    const filterElement = document.getElementById('browse-filter-section');

    if (filterElement) {
        filterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

const { rooms, isFetching, totalCount, fetchTenantRooms } = useTenantRoom();

const ITEMS_PER_PAGE = 9;

const { currentPage, perPage, resetPage } = usePagination(ITEMS_PER_PAGE, async newPage => {
    await fetchData(newPage);

    setTimeout(() => {
        scrollAfterPagination();
    }, 50);
});

const totalPages = computed(() => {
    const total = Number(totalCount.value) || 0;
    return Math.ceil(total / perPage.value) || 1;
});

const { roomType, floor, minPrice, maxPrice, facilities, resetFilters, getCleanParams } = useRoomFilter(() => {
    resetPage();
    fetchData(1);
});

const draft = ref({
    roomType: roomType.value,
    floor: floor.value,
    minPrice: minPrice.value,
    maxPrice: maxPrice.value,
    facilities: [...facilities.value],
});

watch([roomType, floor, minPrice, maxPrice, facilities], ([rt, fl, min, max, fac]) => {
    draft.value = {
        roomType: rt,
        floor: fl,
        minPrice: min,
        maxPrice: max,
        facilities: [...fac],
    };
});

async function fetchData(page = currentPage.value) {
    const params = {
        page,
        limit: perPage.value,
        per_page: perPage.value,
        ...getCleanParams(),
    };
    await fetchTenantRooms(page, params);
}

const handleApplyFilters = () => {
    roomType.value = draft.value.roomType;
    floor.value = draft.value.floor;
    minPrice.value = draft.value.minPrice;
    maxPrice.value = draft.value.maxPrice;
    facilities.value = [...draft.value.facilities];
};

const handleResetFilters = () => {
    draft.value = { roomType: '', floor: '', minPrice: '', maxPrice: '', facilities: [] };
    resetFilters();
};

onMounted(() => {
    fetchData(currentPage.value);
});
</script>

<template>
    <div class="flex flex-col w-full px-6 md:px-12 py-8 md:py-1200">
        <BrowseHeroSection />
        <div id="browse-filter-section" class="mt-8 md:mt-10 w-full">
            <BrowseFilterSection
                v-model:roomType="draft.roomType"
                v-model:floor="draft.floor"
                v-model:minPrice="draft.minPrice"
                v-model:maxPrice="draft.maxPrice"
                v-model:facilities="draft.facilities"
                :isFetching="isFetching"
                @applyFilters="handleApplyFilters"
                @reset="handleResetFilters"
            />
        </div>
        <section aria-label="Room Results" class="w-full mt-12 md:mt-16">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full" :aria-busy="isFetching">
                <template v-if="isFetching">
                    <RoomCardSkeleton v-for="n in perPage" :key="`skeleton-${n}`" />
                </template>

                <template v-else-if="rooms.length > 0">
                    <RoomCard v-for="room in rooms" :key="room.id" :room="room" />
                </template>

                <div v-else class="col-span-full w-full py-20 flex flex-col items-center justify-center text-center px-4">
                    <div class="w-16 h-16 mb-4 text-neutral-400 bg-neutral-100 rounded-full flex items-center justify-center">
                        <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <h3 class="text-h4 text-text-primary mb-2">No rooms found</h3>
                    <p class="text-body-md text-text-secondary max-w-md mb-6">We couldn't find any available rooms matching your current filters.</p>
                    <BaseButton variant="primary" size="md" @click="handleResetFilters"> Clear All Filters </BaseButton>
                </div>
            </div>
        </section>

        <section v-if="!isFetching && rooms.length > 0" aria-label="Page navigation" class="w-full mt-12 md:mt-16">
            <div class="flex justify-center w-full">
                <AppPagination v-model="currentPage" :total-pages="totalPages" />
            </div>
        </section>
    </div>
</template>
