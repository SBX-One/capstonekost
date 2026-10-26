<script setup>
import { computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTenantRoom } from '@/composables/useTenantRoom';
import { useAuthStore } from '@/stores/authStore';

import RoomDetailGallery from '@/components/rooms/detail/RoomDetailGallery.vue';
import RoomDetailInfo from '@/components/rooms/detail/RoomDetailInfo.vue';
import RoomDetailSidebar from '@/components/rooms/detail/RoomDetailSidebar.vue';

const props = defineProps({
    id: {
        type: [String, Number],
        required: true,
    },
});

const router = useRouter();
const authStore = useAuthStore();
const { fetchTenantRoomById, getRoomById, isFetching } = useTenantRoom();

const room = computed(() => getRoomById(props.id));

const loadRoomData = async roomId => {
    try {
        await fetchTenantRoomById(roomId);
        if (!room.value) {
            router.replace({ name: 'public-rooms' });
        }
    } catch (error) {
        console.error('Failed to fetch room detail:', error);
        router.replace({ name: 'public-rooms' });
    }
};

onMounted(() => {
    loadRoomData(props.id);
});

watch(
    () => props.id,
    newId => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        loadRoomData(newId);
    }
);

const handleBack = () => {
    router.back();
};

const handleAskClick = () => {
    console.log('Open Ask Owner Modal for Room ID:', props.id);
};

const handleBookClick = payload => {
    if (authStore.isAuthenticated) {
        router.push({
            name: 'tenant-booking-request',
            params: { id: props.id },
            query: { moveIn: payload?.checkInDate },
        });
    } else {
        console.log('User not logged in. Open Sign In Modal / Redirect for Booking Room ID:', props.id);
    }
};
</script>

<template>
    <div class="w-full px-6 md:px-12 py-8 md:py-1200" :aria-busy="isFetching">
        <button @click="handleBack" class="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-6 w-fit cursor-pointer focus:outline-none">
            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.33301 10H16.6663" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor" />
                <path d="M8.33301 5L3.33301 10L8.33301 15" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor" />
            </svg>
            <span class="text-body-lg font-medium">Back to Room</span>
        </button>

        <div v-if="isFetching && !room" class="flex flex-col w-full gap-8 md:gap-14 animate-pulse">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 w-full">
                <div class="lg:col-span-9 w-full aspect-4/3 lg:aspect-auto lg:h-150 xl:h-173 rounded-lg bg-neutral-200"></div>
                <div class="hidden lg:flex lg:col-span-3 flex-col gap-4 lg:h-150 xl:h-173">
                    <div v-for="i in 4" :key="'thumb-' + i" class="w-full flex-1 rounded-lg bg-neutral-200"></div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div class="lg:col-span-8 flex flex-col gap-12 w-full">
                    <section class="flex flex-col gap-4">
                        <div class="flex items-center gap-6 flex-wrap">
                            <div class="w-3/4 md:w-1/2 h-10 md:h-12 bg-neutral-200 rounded-lg"></div>
                            <div class="w-24 h-8 bg-neutral-200 rounded-full"></div>
                        </div>
                        <div class="w-1/3 h-6 bg-neutral-200 rounded-md"></div>
                    </section>
                    <section class="flex flex-col gap-3">
                        <div class="w-32 h-8 bg-neutral-200 rounded-md"></div>
                        <div class="flex flex-col gap-2">
                            <div v-for="i in 3" :key="'desc-' + i" class="h-4 bg-neutral-200 rounded-sm" :class="i === 3 ? 'w-5/6' : 'w-full'"></div>
                        </div>
                    </section>
                    <section class="flex flex-col gap-3">
                        <div class="w-40 h-8 bg-neutral-200 rounded-md"></div>
                        <div class="flex overflow-hidden gap-0 w-fit max-w-full border border-neutral-200 rounded-default divide-x divide-neutral-200">
                            <div v-for="i in 2" :key="'fac-' + i" class="flex flex-col justify-between px-3 py-4 gap-4 shrink-0 w-55 lg:w-65 bg-neutral-50/50">
                                <div class="w-2/3 h-5 bg-neutral-200 rounded-sm"></div>
                                <div class="flex items-start gap-3 w-full">
                                    <div class="w-6 h-6 bg-neutral-200 rounded-full shrink-0"></div>
                                    <div class="w-full flex flex-col gap-1">
                                        <div class="w-full h-4 bg-neutral-200 rounded-sm"></div>
                                        <div class="w-3/4 h-4 bg-neutral-200 rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section class="flex flex-col gap-3">
                        <div class="w-32 h-8 bg-neutral-200 rounded-md"></div>
                        <div class="flex overflow-hidden gap-0 w-fit max-w-full border border-neutral-200 rounded-default divide-x divide-neutral-200">
                            <div v-for="i in 2" :key="'util-' + i" class="flex flex-col justify-between px-3 py-4 gap-4 shrink-0 w-55 lg:w-65 bg-neutral-50/50">
                                <div class="w-1/2 h-5 bg-neutral-200 rounded-sm"></div>
                                <div class="flex items-start gap-3 w-full">
                                    <div class="w-6 h-6 bg-neutral-200 rounded-full shrink-0"></div>
                                    <div class="flex flex-col gap-1 w-full">
                                        <div class="w-full h-4 bg-neutral-200 rounded-sm"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <aside class="lg:col-span-4 sticky top-24 w-full">
                    <div class="bg-neutral-200 rounded-default px-6 py-8 flex flex-col gap-10 shadow-sm">
                        <div class="flex flex-col gap-1 min-w-0">
                            <div class="w-24 h-5 bg-neutral-300 rounded-sm"></div>
                            <div class="w-3/4 h-10 sm:h-12 bg-neutral-300 rounded-lg"></div>
                        </div>
                        <div class="flex flex-col gap-3">
                            <div class="w-28 h-6 bg-neutral-300 rounded-sm"></div>
                            <div class="w-full h-13.5 bg-neutral-300 rounded-xl"></div>
                        </div>
                        <div class="flex flex-col gap-4">
                            <div class="w-full h-14 bg-neutral-300 rounded-default"></div>
                            <div class="w-full h-14 bg-neutral-300 rounded-default"></div>
                            <div class="flex items-center justify-center gap-3 p-3 mt-1">
                                <div class="w-6 h-6 bg-neutral-300 rounded-full shrink-0"></div>
                                <div class="w-40 h-4 bg-neutral-300 rounded-sm"></div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>

        <div v-else-if="room" class="flex flex-col w-full gap-8 md:gap-14">
            <RoomDetailGallery :image-paths="room.image_paths" />
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                <div class="lg:col-span-8 flex flex-col">
                    <RoomDetailInfo :room="room" />
                </div>
                <aside class="lg:col-span-4 sticky top-24">
                    <RoomDetailSidebar :price="room.price" @ask="handleAskClick" @book="handleBookClick" />
                </aside>
            </div>
        </div>
    </div>
</template>
