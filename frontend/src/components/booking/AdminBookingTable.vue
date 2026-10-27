<script setup>
import { computed } from 'vue';
import AdminBookingTableRow from '@/components/booking/AdminBookingTableRow.vue';

const props = defineProps({
    bookings: {
        type: Array,
        required: true,
        default: () => [],
    },
    isLoading: {
        type: Boolean,
        default: false,
    },
});

const selectedBookingIds = defineModel('selectedBookingIds', { default: () => [] });

const emit = defineEmits(['view']);

const isAllSelected = computed(() => {
    if (props.bookings.length === 0) return false;
    return props.bookings.every(booking => selectedBookingIds.value.includes(booking.id));
});

const isIndeterminate = computed(() => {
    if (selectedBookingIds.value.length === 0) return false;
    return !isAllSelected.value && props.bookings.some(booking => selectedBookingIds.value.includes(booking.id));
});

const toggleSelectAll = event => {
    const checked = event.target.checked;
    const pageBookingIds = props.bookings.map(booking => booking.id);

    if (checked) {
        selectedBookingIds.value = Array.from(new Set([...selectedBookingIds.value, ...pageBookingIds]));
    } else {
        selectedBookingIds.value = selectedBookingIds.value.filter(id => !pageBookingIds.includes(id));
    }
};
</script>

<template>
    <div class="bg-bg-default border border-border-default rounded-default overflow-hidden">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[1200px]">
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
                        <th class="py-3.5 px-4 font-medium">Name</th>
                        <th class="py-3.5 px-4 font-medium">Email</th>
                        <th class="py-3.5 px-4 font-medium">Phone Number</th>
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Move-in</th>
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Move-out</th>
                        <th class="py-3.5 px-4 font-medium">Duration</th>
                        <th class="py-3.5 px-4 font-medium whitespace-nowrap">Price Total</th>
                        <th class="py-3.5 px-4 font-medium">Status</th>
                        <th class="py-3.5 px-4 font-medium text-center">Action</th>
                    </tr>
                </thead>

                <tbody>
                    <tr v-if="isLoading">
                        <td colspan="11" class="py-12 text-center text-text-secondary text-body-md">
                            <div class="inline-flex items-center gap-2">
                                <svg class="animate-spin -ml-1 mr-3 h-5 text-action-primary" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path
                                        class="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                </svg>
                                <span>Loading booking data...</span>
                            </div>
                        </td>
                    </tr>

                    <tr v-else-if="bookings.length === 0">
                        <td colspan="11" class="py-12 text-center text-text-secondary text-body-md">No booking records found.</td>
                    </tr>

                    <template v-else>
                        <AdminBookingTableRow
                            v-for="booking in bookings"
                            :key="booking.id"
                            :booking="booking"
                            :model-value="selectedBookingIds.includes(booking.id)"
                            @update:model-value="
                                checked => {
                                    if (checked) {
                                        selectedBookingIds = [...selectedBookingIds, booking.id];
                                    } else {
                                        selectedBookingIds = selectedBookingIds.filter(id => id !== booking.id);
                                    }
                                }
                            "
                            @view="$emit('view', booking)"
                        />
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>
