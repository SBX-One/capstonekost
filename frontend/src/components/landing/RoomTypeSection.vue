<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useIsolatedTenantRooms } from '@/composables/useIsolatedTenantRooms';
import OptionSwitcher from '@/components/common/OptionSwitcher.vue';
import RoomCard from '@/components/rooms/RoomCard.vue';
import RoomCardSkeleton from '@/components/rooms/RoomCardSkeleton.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const { localRooms, isLocalFetching, fetchIsolatedRooms, abortIsolatedFetch } = useIsolatedTenantRooms();

const roomTypeOptions = [
    { label: 'Single Room', value: 1 },
    { label: 'Double Room', value: 2 },
    { label: 'Master Room', value: 3 },
];

const selectedTypeId = ref(1);

onMounted(async () => {
    await fetchIsolatedRooms({ limit: 6, room_type: selectedTypeId.value });
});

watch(selectedTypeId, async newTypeId => {
    await fetchIsolatedRooms({ limit: 6, room_type: newTypeId });
});

onBeforeUnmount(() => {
    abortIsolatedFetch();
});

const navigateToAllRooms = () => {
    router.push({
        path: '/tenant/rooms',
        query: { room_type: selectedTypeId.value },
    });
};

const getSelectedTypeName = () => {
    const opt = roomTypeOptions.find(o => o.value === selectedTypeId.value);
    return opt ? opt.label : 'Room';
};
</script>

<template>
    <section aria-labelledby="room-type-heading" class="w-full px-6 md:px-12 bg-bg-default flex flex-col items-center gap-8 md:gap-14">
        <span class="px-4 py-2 w-fit border border-border-default rounded-xl text-body-md text-text-secondary bg-transparent select-none"> Type Room </span>
        <div class="flex flex-col gap-10 md:gap-16 w-full">
            <h2 id="room-type-heading" class="text-h3 md:text-h2 text-center text-text-primary tracking-tight">Find the Room Type That Fits You</h2>
            <div class="flex flex-col gap-8 md:gap-14">
                <div class="flex justify-center w-full">
                    <OptionSwitcher v-model="selectedTypeId" :options="roomTypeOptions" aria-label="Filter rooms by type" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full" :aria-busy="isLocalFetching">
                    <template v-if="isLocalFetching">
                        <RoomCardSkeleton v-for="index in 6" :key="`type-skeleton-${index}`" />
                    </template>

                    <template v-else-if="localRooms.length > 0">
                        <RoomCard v-for="room in localRooms" :key="room.id" :room="room" />
                    </template>

                    <div v-else class="col-span-full py-16 text-center text-text-secondary flex flex-col items-center justify-center gap-2">
                        <p class="text-body-lg font-medium">No {{ getSelectedTypeName() }}s available at the moment.</p>
                        <p class="text-body-sm">Try selecting another room type or explore all rooms.</p>
                    </div>
                </div>

                <div class="flex justify-center w-full">
                    <BaseButton variant="primary" size="md" class="shadow-sm hover:shadow-md transition-all select-none" @click="navigateToAllRooms"> See all Rooms </BaseButton>
                </div>
            </div>
        </div>
    </section>
</template>
