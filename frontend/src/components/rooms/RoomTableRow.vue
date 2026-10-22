<script setup>
import { computed } from 'vue';
import { useRoom } from '@/composables/useRoom';
import { getImageUrl } from '@/utils/imageUtils';
import RoomStatusBadge from '@/components/common/RoomStatusBadge.vue';
import RoomActionButtons from '@/components/common/RoomActionButtons.vue';

const props = defineProps({
    room: {
        type: Object,
        required: true,
        default: () => ({}),
    },
});

const isSelected = defineModel({ default: false });
defineEmits(['view', 'edit', 'delete']);

const { formatRupiah } = useRoom();

const neutralFallbackImage =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 24 24' fill='none' stroke='%23a3a3a3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";

const roomImage = computed(() => {
    if (Array.isArray(props.room.images) && props.room.images.length > 0) {
        const mainImage = props.room.images.find(img => img.sort_order === 1) || props.room.images[0];
        return getImageUrl(mainImage.image_path);
    }
    return props.room.image ? getImageUrl(props.room.image) : neutralFallbackImage;
});

const roomName = computed(() => {
    return props.room.name || props.room.room_number || 'N/A';
});

const roomTypeName = computed(() => {
    if (typeof props.room.room_type === 'object' && props.room.room_type !== null) {
        return props.room.room_type.name || 'Standard Room';
    }
    return props.room.type_room || 'Standard Room';
});

const formattedFacilities = computed(() => {
    if (!props.room.facilities) return '-';

    if (Array.isArray(props.room.facilities)) {
        return props.room.facilities
            .map(facility => (typeof facility === 'object' ? facility.name : facility))
            .filter(Boolean)
            .join(', ');
    }

    return String(props.room.facilities);
});
</script>

<template>
    <tr class="hover:bg-neutral-50/80 transition-colors border-b border-border-default last:border-none">
        <td class="py-4 px-4 align-middle w-10">
            <input
                type="checkbox"
                v-model="isSelected"
                class="w-5 h-5 rounded-default border border-border-default bg-bg-default checked:bg-neutral-900 checked:border-neutral-900 focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none relative flex items-center justify-center transition-colors checked:after:content-[''] checked:after:w-1.5 checked:after:h-2.5 checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:rotate-45 checked:after:absolute checked:after:-mt-0.5"
            />
        </td>

        <td class="py-4 px-4 align-middle">
            <div class="flex items-center gap-4">
                <img
                    :src="roomImage"
                    :alt="roomName"
                    class="w-37.5 h-25 object-cover rounded-default shrink-0 border border-border-default shadow-sm"
                    @error="$event.target.src = neutralFallbackImage"
                />
                <span class="text-body-md text-text-primary font-medium max-w-[200px] truncate" :title="roomName">
                    {{ roomName }}
                </span>
            </div>
        </td>

        <td class="py-4 px-4 align-middle text-body-md text-text-secondary max-w-37.5 truncate" :title="roomTypeName">
            {{ roomTypeName }}
        </td>

        <td class="py-4 px-4 align-middle text-body-md text-text-secondary">
            {{ room.floor ?? '-' }}
        </td>

        <td class="py-4 px-4 align-middle text-body-md text-text-primary whitespace-nowrap">
            {{ formatRupiah(room.price) }}
        </td>

        <td class="py-4 px-4 align-middle text-body-sm text-text-secondary max-w-xs truncate" :title="formattedFacilities">
            {{ formattedFacilities }}
        </td>

        <td class="py-4 px-4 align-middle whitespace-nowrap">
            <RoomStatusBadge :status="room.status" />
        </td>

        <td class="py-4 px-4 align-middle text-right whitespace-nowrap">
            <RoomActionButtons @view="$emit('view', room)" @edit="$emit('edit', room)" @delete="$emit('delete', room)" />
        </td>
    </tr>
</template>
