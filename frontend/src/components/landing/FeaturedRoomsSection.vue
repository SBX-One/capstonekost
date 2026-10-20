<script setup>
import { onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useIsolatedTenantRooms } from '@/composables/useIsolatedTenantRooms';
import RoomCard from '@/components/rooms/RoomCard.vue';
import RoomCardSkeleton from '@/components/rooms/RoomCardSkeleton.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const { localRooms, isLocalFetching, fetchIsolatedRooms, abortIsolatedFetch } = useIsolatedTenantRooms();

onMounted(async () => {
    await fetchIsolatedRooms({ limit: 6 });
});

onBeforeUnmount(() => {
    abortIsolatedFetch();
});

const navigateToAllRooms = () => {
    router.push('/tenant/rooms');
};
</script>

<template>
    <section aria-labelledby="featured-rooms-heading" class="w-full px-6 md:px-12 py-8 md:py-1200 bg-bg-default flex flex-col gap-8 md:gap-14">
        <span class="px-4 py-2 w-fit border border-border-default rounded-xl text-body-md text-text-secondary bg-transparent select-none"> Our Rooms </span>
        <div class="flex flex-col gap-8 md:gap-14">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-end w-full">
                <h2 id="featured-rooms-heading" class="text-h3 md:text-h2 text-text-primary tracking-tight">Choose Your Perfect Space</h2>
                <div class="flex flex-col items-start lg:items-end">
                    <p class="text-body-md md:text-body-lg max-w-md text-text-secondary text-left lg:text-right">
                        Explore our available rooms and choose the space that matches your needs, comfort, and everyday lifestyle.
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full" :aria-busy="isLocalFetching">
                <template v-if="isLocalFetching && localRooms.length === 0">
                    <RoomCardSkeleton v-for="index in 6" :key="`skeleton-${index}`" />
                </template>

                <template v-else-if="localRooms.length > 0">
                    <RoomCard v-for="room in localRooms" :key="room.id" :room="room" />
                </template>

                <div v-else class="col-span-full py-16 text-center text-text-secondary flex flex-col items-center justify-center gap-2">
                    <p class="text-body-lg font-medium">No rooms available at the moment.</p>
                    <p class="text-body-sm">Please check back later or contact our administrator.</p>
                </div>
            </div>

            <div class="flex justify-center w-full">
                <BaseButton variant="primary" size="md" class="shadow-sm hover:shadow-md transition-all select-none" @click="navigateToAllRooms"> See all Rooms </BaseButton>
            </div>
        </div>
    </section>
</template>
