<script setup>
import { computed } from 'vue';
import dayjs from 'dayjs';
import { useTenantRoom } from '@/composables/useTenantRoom';
import RoomStatusBadge from '@/components/common/RoomStatusBadge.vue';

const props = defineProps({
    booking: {
        type: Object,
        required: true,
        default: () => ({}),
    },
});

const isSelected = defineModel({ default: false });
defineEmits(['view']);

const { formatRupiah } = useTenantRoom();

const roomName = computed(() => props.booking.booked_room?.name || '-');
const tenantName = computed(() => props.booking.booking_contacts?.name || '-');
const tenantEmail = computed(() => props.booking.booking_contacts?.email || '-');
const tenantPhone = computed(() => props.booking.booking_contacts?.phone || '-');
const moveIn = computed(() => (props.booking.booking_records?.move_in ? dayjs(props.booking.booking_records.move_in).format('DD MMM YYYY') : '-'));
const moveOut = computed(() => (props.booking.booking_records?.move_out ? dayjs(props.booking.booking_records.move_out).format('DD MMM YYYY') : '-'));
const duration = computed(() => (props.booking.booking_records?.rental_duration ? `${props.booking.booking_records.rental_duration} Months` : '-'));
const priceTotal = computed(() => formatRupiah(props.booking.booking_records?.total || 0));
const status = computed(() => props.booking.booking_records?.status || 'pending');
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

        <td class="py-4 px-4 align-middle text-body-md text-text-primary font-medium">{{ roomName }}</td>
        <td class="py-4 px-4 align-middle text-body-md text-text-primary max-w-37.5 truncate" :title="tenantName">{{ tenantName }}</td>
        <td class="py-4 px-4 align-middle text-body-md text-text-secondary max-w-[200px] truncate" :title="tenantEmail">{{ tenantEmail }}</td>
        <td class="py-4 px-4 align-middle text-body-md text-text-secondary whitespace-nowrap">{{ tenantPhone }}</td>
        <td class="py-4 px-4 align-middle text-body-md text-text-secondary whitespace-nowrap">{{ moveIn }}</td>
        <td class="py-4 px-4 align-middle text-body-md text-text-secondary whitespace-nowrap">{{ moveOut }}</td>
        <td class="py-4 px-4 align-middle text-body-md text-text-secondary whitespace-nowrap">{{ duration }}</td>
        <td class="py-4 px-4 align-middle text-body-md text-text-primary whitespace-nowrap">{{ priceTotal }}</td>
        <td class="py-4 px-4 align-middle whitespace-nowrap">
            <RoomStatusBadge :status="status" />
        </td>
        <td class="py-4 px-4 align-middle text-center whitespace-nowrap">
            <button
                @click="$emit('view', booking)"
                class="p-1.5 inline-flex items-center justify-center rounded-default text-text-secondary hover:text-action-primary hover:bg-action-secondary-hover transition-colors cursor-pointer focus:outline-none"
                title="View Booking Detail"
            >
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M8.65234 12.4987C8.65234 11.3936 9.05756 10.3338 9.77886 9.55242C10.5001 8.77102 11.4784 8.33203 12.4985 8.33203C13.5186 8.33203 14.4968 8.77102 15.2181 9.55242C15.9394 10.3338 16.3447 11.3936 16.3447 12.4987C16.3447 13.6038 15.9394 14.6636 15.2181 15.445C14.4968 16.2264 13.5186 16.6654 12.4985 16.6654C11.4784 16.6654 10.5001 16.2264 9.77886 15.445C9.05756 14.6636 8.65234 13.6038 8.65234 12.4987ZM12.4985 9.9987C11.8865 9.9987 11.2995 10.2621 10.8667 10.7309C10.4339 11.1998 10.1908 11.8357 10.1908 12.4987C10.1908 13.1617 10.4339 13.7976 10.8667 14.2665C11.2995 14.7353 11.8865 14.9987 12.4985 14.9987C13.1105 14.9987 13.6975 14.7353 14.1303 14.2665C14.5631 13.7976 14.8062 13.1617 14.8062 12.4987C14.8062 11.8357 14.5631 11.1998 14.1303 10.7309C13.6975 10.2621 13.1105 9.9987 12.4985 9.9987Z"
                        fill="currentColor"
                    />
                    <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M4.62615 10.9956C4.19641 11.6667 4.03846 12.1922 4.03846 12.5C4.03846 12.8078 4.19641 13.3333 4.62615 14.0044C5.04256 14.6522 5.66 15.3556 6.44154 16.0056C8.00769 17.3078 10.1544 18.3333 12.5 18.3333C14.8456 18.3333 16.9923 17.3078 18.5585 16.0056C19.34 15.3556 19.9574 14.6522 20.3738 14.0044C20.8036 13.3333 20.9615 12.8078 20.9615 12.5C20.9615 12.1922 20.8036 11.6667 20.3738 10.9956C19.9574 10.3478 19.34 9.64444 18.5585 8.99444C16.9923 7.69222 14.8456 6.66667 12.5 6.66667C10.1544 6.66667 8.00769 7.69222 6.44154 8.99444C5.66 9.64444 5.04256 10.3478 4.62615 10.9956ZM5.5041 7.67222C7.27949 6.19667 9.74718 5 12.5 5C15.2528 5 17.7205 6.19667 19.4949 7.67222C20.3841 8.41111 21.1185 9.23556 21.6374 10.0456C22.1421 10.8333 22.5 11.6967 22.5 12.5C22.5 13.3033 22.141 14.1667 21.6374 14.9544C21.1185 15.7644 20.3841 16.5878 19.4959 17.3278C17.7215 18.8033 15.2528 20 12.5 20C9.74718 20 7.27949 18.8033 5.50513 17.3278C4.6159 16.5889 3.88154 15.7644 3.36256 14.9544C2.85897 14.1667 2.5 13.3033 2.5 12.5C2.5 11.6967 2.85897 10.8333 3.36256 10.0456C3.88154 9.23556 4.6159 8.41222 5.5041 7.67222Z"
                        fill="currentColor"
                    />
                </svg>
            </button>
        </td>
    </tr>
</template>
