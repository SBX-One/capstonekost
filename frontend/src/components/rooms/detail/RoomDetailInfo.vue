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
                        <FacilityIcon :name="utility.name" class="w-6 h-6 text-text-primary shrink-0 mt-0.5" />
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
