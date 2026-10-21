<script setup>
import RoomStatusBadge from '@/components/common/RoomStatusBadge.vue';
import FacilityIcon from '@/components/rooms/FacilityIcon.vue';

defineProps({
    room: {
        type: Object,
        required: true,
    },
});
</script>

<template>
    <div v-if="room" class="flex flex-col gap-12 w-full">
        <section aria-labelledby="room-title" class="flex flex-col gap-4">
            <div class="flex items-center gap-6 flex-wrap">
                <h1 id="room-title" class="text-h2 md:text-h1 font-bold text-text-primary leading-tight">
                    {{ room.room_type?.name || 'Standard Room' }}
                </h1>
                <RoomStatusBadge :status="room.status" />
            </div>
            <p class="text-h4 text-text-secondary">Room {{ room.name }} &bull; Floor {{ room.floor }}</p>
        </section>

        <section aria-labelledby="room-description" class="flex flex-col gap-3">
            <h2 id="room-description" class="text-h3 text-text-primary">Description</h2>
            <p class="text-body-lg text-text-secondary leading-relaxed text-justify">
                {{ room.description || room.overview || 'No description available for this room.' }}
            </p>
        </section>

        <section v-if="room.facilities && room.facilities.length > 0" aria-labelledby="room-facilities" class="flex flex-col gap-3">
            <h2 id="room-facilities" class="text-h3 text-text-primary">Facilities included</h2>
            <div class="flex overflow-x-auto w-fit max-w-full border border-border-default rounded-default bg-neutral-50 divide-x divide-border-default custom-scrollbar">
                <div
                    v-for="facility in room.facilities"
                    :key="facility.id"
                    class="flex flex-col justify-between px-3 py-4 gap-4 bg-transparent shrink-0 w-55 lg:w-65 transition-colors duration-300 ease-in-out hover:bg-neutral-100 cursor-default"
                >
                    <span class="text-h5 text-text-secondary truncate" :title="facility.name">
                        {{ facility.name }}
                    </span>
                    <div class="flex items-start gap-3 w-full">
                        <FacilityIcon :name="facility.name" class="w-6 h-6 text-text-primary shrink-0 mt-0.5" />
                        <span class="text-h4 text-text-primary wrap-break-word line-clamp-2" :title="facility.information">
                            {{ facility.information }}
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <section v-if="room.utilities && room.utilities.length > 0" aria-labelledby="room-utilities" class="flex flex-col gap-3">
            <h2 id="room-utilities" class="text-h3 text-text-primary">Utilities</h2>
            <div class="flex overflow-x-auto w-fit max-w-full border border-border-default rounded-default bg-neutral-50 divide-x divide-border-default custom-scrollbar">
                <div
                    v-for="utility in room.utilities"
                    :key="utility.id"
                    class="flex flex-col justify-between px-3 py-4 gap-4 bg-transparent shrink-0 w-55 lg:w-65 transition-colors duration-300 ease-in-out hover:bg-neutral-100 cursor-default"
                >
                    <span class="text-h5 text-text-secondary truncate" :title="utility.name">
                        {{ utility.name }}
                    </span>
                    <div class="flex items-start gap-3 w-full">
                        <svg v-if="utility.name.toLowerCase().includes('water')" class="w-6 h-6 text-text-primary shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M16.7857 13.385C16.7878 14.6027 16.2812 15.7732 15.3736 16.648C14.8681 17.1324 14.2521 17.5043 13.5714 17.736M20 13.692C20 13.6918 20 13.6917 20 13.6915M20 13.6915C19.9996 7.11473 12.5 2 12.5 2C12.5 2 5 7.115 5 13.692C5 15.63 5.78964 17.489 7.19643 18.86C8.60321 20.231 10.5114 21 12.5 21C14.4886 21 16.3968 20.23 17.8036 18.86C19.2102 17.4901 19.9999 15.6303 20 13.6915ZM20 13.6915C20 13.6913 20 13.6912 20 13.691"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke="currentColor"
                            />
                        </svg>

                        <svg
                            v-else-if="utility.name.toLowerCase().includes('electricity')"
                            class="w-6 h-6 text-text-primary shrink-0 mt-0.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M9.53809 2V4.7M16.4612 2V4.7M12.9996 16.4V20M13.8004 7.85L11.3877 9.8075C11.1292 10.0172 11.3139 10.3187 11.7362 10.3745L14.2631 10.7093C14.7131 10.7687 14.8839 11.1035 14.57 11.3069L11.5769 13.25"
                                stroke-width="1.5"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke="currentColor"
                            />
                            <path
                                d="M15.6619 4.69922H10.3381C7.87114 4.69922 6.63767 4.69922 5.95575 5.32742C5.27498 5.95472 5.4619 6.91862 5.8369 8.84642L6.44152 11.9514C7.04152 15.0348 8.7146 16.3992 13 16.3992C17.2854 16.3992 18.9585 15.0348 19.5585 11.9514L20.1631 8.84642C20.5381 6.91862 20.725 5.95472 20.0443 5.32742C19.3635 4.70012 18.1289 4.69922 15.6619 4.69922Z"
                                stroke-width="1.5"
                                stroke="currentColor"
                            />
                        </svg>

                        <FacilityIcon v-else :name="utility.name" class="w-6 h-6 text-text-primary shrink-0 mt-0.5" />
                        <span class="text-h4 text-text-primary wrap-break-word line-clamp-2" :title="utility.information">
                            {{ utility.information }}
                        </span>
                    </div>
                </div>
            </div>
        </section>

        <section v-if="room.rules" aria-labelledby="room-rules" class="flex flex-col gap-3">
            <h2 id="room-rules" class="text-h3 text-text-primary">Rules</h2>
            <p class="text-body-lg text-text-secondary leading-relaxed text-justify">
                {{ room.rules }}
            </p>
        </section>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    display: none;
}
.custom-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
