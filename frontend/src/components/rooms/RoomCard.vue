<script setup>
import { computed } from 'vue';
import { useTenantRoom } from '@/composables/useTenantRoom';
import RoomStatusBadge from '@/components/common/RoomStatusBadge.vue';
import FacilityIcon from '@/components/rooms/FacilityIcon.vue';

const props = defineProps({
    room: {
        type: Object,
        required: true,
        default: () => ({
            id: '',
            name: '',
            room_type: null,
            floor: 1,
            price: 0,
            status: 'available',
            overview: '',
            description: '',
            images: [],
            facilities: [],
        }),
    },
});

const { formatRupiah, navigateToDetail } = useTenantRoom();

const getImageUrl = path => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

const primaryImage = computed(() => {
    const images = props.room.images;
    if (Array.isArray(images) && images.length > 0) {
        const featured = images.find(img => img.sort_order === 1) || images[0];
        return getImageUrl(featured?.image_path);
    }
    return getImageUrl(props.room.image_url);
});

const displayTitle = computed(() => {
    return props.room.room_type?.name || props.room.name || 'Room';
});

const displayOverview = computed(() => {
    return props.room.overview || props.room.description || '';
});

const normalizedFacilities = computed(() => {
    if (!Array.isArray(props.room.facilities)) return [];
    return props.room.facilities.map(item => (typeof item === 'object' ? item.name : item));
});

const displayedFacilities = computed(() => {
    return normalizedFacilities.value.slice(0, 3);
});

const extraFacilitiesCount = computed(() => {
    const total = normalizedFacilities.value.length;
    return total > 3 ? total - 3 : 0;
});

const resolveFacilityIcon = facilityName => {
    if (facilityName.toLowerCase().includes('bed')) return 'Bed';
    return facilityName;
};

const handleCardClick = () => {
    if (props.room.id) {
        navigateToDetail(props.room.id);
    }
};
</script>

<template>
    <article
        @click="handleCardClick"
        class="group relative w-full aspect-4/5 rounded-xl overflow-hidden shadow-default cursor-pointer select-none transition-all duration-500 ease-out hover:-translate-y-1.5 hover:shadow-xl flex flex-col justify-between p-5 md:p-6"
        :aria-label="`Room card: ${displayTitle}, Room ${room.name}`"
    >
        <img
            v-if="primaryImage"
            :src="primaryImage"
            :alt="`Interior of ${displayTitle} - Room ${room.name}`"
            class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 will-change-transform"
            loading="lazy"
        />
        <div v-else class="absolute inset-0 bg-neutral-800" />

        <div
            class="absolute inset-x-0 bottom-0 h-[65%] backdrop-blur-md md:backdrop-blur-lg [-webkit-mask-image:linear-gradient(to_top,black_45%,transparent_100%)] mask-[linear-gradient(to_top,black_45%,transparent_100%)] pointer-events-none transition-all duration-500"
            aria-hidden="true"
        />

        <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 via-50% to-transparent pointer-events-none transition-opacity duration-500 group-hover:opacity-95" aria-hidden="true" />
        <div class="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" aria-hidden="true" />

        <div class="relative z-10 flex justify-end items-start w-full">
            <RoomStatusBadge :status="room.status" />
        </div>

        <div class="relative z-10 flex flex-col gap-5 md:gap-6 text-text-inverse">
            <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between gap-2">
                    <h3 class="text-h4 text-text-inverse font-semibold tracking-tight truncate drop-shadow-xs">
                        {{ displayTitle }}
                    </h3>
                    <span class="px-2 py-1 text-body-sm text-text-inverse bg-black/40 backdrop-blur-md rounded-xl shrink-0 font-medium border border-white/15">
                        Floor {{ room.floor }} · Room {{ room.name }}
                    </span>
                </div>

                <p class="text-body-md text-text-inverse line-clamp-2 leading-relaxed">
                    {{ displayOverview }}
                </p>
            </div>

            <div class="flex items-baseline gap-1">
                <span class="text-h4 font-bold text-text-inverse tracking-tight drop-shadow-xs">
                    {{ formatRupiah(room.price) }}
                </span>
                <span class="text-body-sm text-text-inverse font-normal"> /month </span>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
                <div
                    v-for="facility in displayedFacilities"
                    :key="facility"
                    class="inline-flex items-center gap-2 px-2 py-1 text-body-sm text-text-inverse bg-black/40 backdrop-blur-md rounded-xl border border-white/15 transition-colors hover:bg-black/55"
                >
                    <FacilityIcon :name="resolveFacilityIcon(facility)" class="w-3.5 h-3.5 text-text-inverse" />
                    <span>{{ facility }}</span>
                </div>

                <span v-if="extraFacilitiesCount > 0" class="text-body-sm text-text-inverse font-medium px-2 py-1"> +{{ extraFacilitiesCount }} </span>
            </div>
        </div>
    </article>
</template>
