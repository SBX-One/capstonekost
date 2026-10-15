<script setup>
import { computed } from 'vue';
import RoomTableRow from '@/components/rooms/RoomTableRow.vue';

const props = defineProps({
    rooms: {
        type: Array,
        required: true,
        default: () => [],
    },
    isFetching: {
        type: Boolean,
        default: false,
    },
});

const selectedRoomIds = defineModel('selectedRoomIds', { default: () => [] });

const emit = defineEmits(['view', 'edit', 'delete']);

const isAllSelected = computed(() => {
    if (props.rooms.length === 0) return false;
    return props.rooms.every(room => selectedRoomIds.value.includes(room.id));
});

const isIndeterminate = computed(() => {
    if (selectedRoomIds.value.length === 0) return false;
    return !isAllSelected.value && props.rooms.some(room => selectedRoomIds.value.includes(room.id));
});

const toggleSelectAll = event => {
    const checked = event.target.checked;
    const pageRoomIds = props.rooms.map(room => room.id);

    if (checked) {
        selectedRoomIds.value = Array.from(new Set([...selectedRoomIds.value, ...pageRoomIds]));
    } else {
        selectedRoomIds.value = selectedRoomIds.value.filter(id => !pageRoomIds.includes(id));
    }
};
</script>

<template>
    <div class="bg-bg-default border border-border-default rounded-default overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-border-default bg-neutral-100 text-body-md text-text-secondary uppercase tracking-wider">
                        <th class="py-3.5 px-4 w-10">
                            <input
                                type="checkbox"
                                :checked="isAllSelected"
                                :indeterminate="isIndeterminate"
                                @change="toggleSelectAll"
                                class="w-5 h-5 rounded-default border border-border-default bg-bg-default checked:bg-neutral-900 checked:border-neutral-900 indeterminate:bg-neutral-900 indeterminate:border-neutral-900 focus:ring-0 focus:ring-offset-0 cursor-pointer appearance-none relative flex items-center justify-center transition-colors checked:after:content-[''] checked:after:w-1.5 checked:after:h-2.5 checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:rotate-45 checked:after:absolute checked:after:-mt-0.5 indeterminate:after:content-[''] indeterminate:after:w-2.5 indeterminate:after:h-0.5 indeterminate:after:bg-white indeterminate:after:absolute"
                            />
                        </th>
                        <th class="py-3.5 px-4 font-medium">Room</th>
                        <th class="py-3.5 px-4 font-medium">Type Room</th>
                        <th class="py-3.5 px-4 font-medium">Floor</th>
                        <th class="py-3.5 px-4 font-medium">Price</th>
                        <th class="py-3.5 px-4 font-medium">Facilities</th>
                        <th class="py-3.5 px-4 font-medium">Status</th>
                        <th class="py-3.5 px-4 font-medium text-right">Actions</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="isFetching">
                        <td colspan="8" class="py-12 text-center text-text-secondary text-body-md">
                            <div class="inline-flex items-center gap-2">
                                <svg class="animate-spin -ml-1 mr-3 h-5 text-action-primary" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span>Loading rooms data...</span>
                            </div>
                        </td>
                    </tr>

                    <tr v-else-if="rooms.length === 0">
                        <td colspan="8" class="py-12 text-center text-text-secondary text-body-md">No rooms found matching the selected filter.</td>
                    </tr>

                    <template v-else>
                        <RoomTableRow
                            v-for="room in rooms"
                            :key="room.id"
                            :room="room"
                            :model-value="selectedRoomIds.includes(room.id)"
                            @update:model-value="
                                checked => {
                                    if (checked) {
                                        selectedRoomIds = [...selectedRoomIds, room.id];
                                    } else {
                                        selectedRoomIds = selectedRoomIds.filter(id => id !== room.id);
                                    }
                                }
                            "
                            @view="$emit('view', room)"
                            @edit="$emit('edit', room)"
                            @delete="$emit('delete', room)"
                        />
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>
