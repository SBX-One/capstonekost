<script setup>
import { computed, ref, onMounted } from 'vue';
import DashboardBaseCard from '@/components/dashboard/DashboardBaseCard.vue';

const props = defineProps({
    totalRooms: {
        type: Number,
        required: true,
        default: 0,
    },
    occupied: {
        type: Number,
        required: true,
        default: 0,
    },
    available: {
        type: Number,
        required: true,
        default: 0,
    },
});

const occupiedPercentage = computed(() => {
    if (props.totalRooms === 0) return '0%';
    return `${((props.occupied / props.totalRooms) * 100).toFixed(2).replace('.', ',')}%`;
});

const availablePercentage = computed(() => {
    if (props.totalRooms === 0) return '0%';
    return `${((props.available / props.totalRooms) * 100).toFixed(2).replace('.', ',')}%`;
});

const radius = 54;
const circumference = 2 * Math.PI * radius;

const dashOffset = ref(circumference);

const targetDashOffset = computed(() => {
    if (props.totalRooms === 0) return circumference;
    const percentage = props.available / props.totalRooms;
    return circumference - percentage * circumference;
});

onMounted(() => {
    setTimeout(() => {
        dashOffset.value = targetDashOffset.value;
    }, 100);
});
</script>

<template>
    <DashboardBaseCard title="Room Occupancy" subtitle="Current room availability">
        <span class="sr-only"> Graphic showing room occupancy. {{ occupied }} rooms are occupied, and {{ available }} rooms are available out of {{ totalRooms }} total rooms. </span>
        <div class="flex items-center gap-8 w-full h-full" aria-hidden="true">
            <div class="relative w-32 h-32 shrink-0">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 128 128" role="img" aria-labelledby="occupancyChartTitle">
                    <title id="occupancyChartTitle">Room Occupancy Donut Chart</title>

                    <circle cx="64" cy="64" :r="radius" fill="none" stroke="currentColor" class="text-neutral-400" stroke-width="12" />
                    <circle
                        cx="64"
                        cy="64"
                        :r="radius"
                        fill="none"
                        stroke="currentColor"
                        class="text-neutral-900"
                        stroke-width="12"
                        stroke-linecap="round"
                        :stroke-dasharray="circumference"
                        :stroke-dashoffset="dashOffset"
                        style="transition: stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)"
                    />
                </svg>

                <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="text-h2 font-semibold text-text-primary">{{ totalRooms }}</span>
                    <span class="text-body-sm text-text-primary -mt-1 tracking-tight">Total Rooms</span>
                </div>
            </div>

            <ul class="flex flex-col justify-center gap-2 flex-1 max-w-55 m-0 p-0 list-none">
                <li class="flex items-center gap-4 w-full text-body-md">
                    <div class="flex items-center gap-2 text-text-primary flex-1">
                        <span class="w-2.5 h-2.5 rounded-full bg-neutral-400 shrink-0" aria-hidden="true"></span>
                        <span class="font-medium">Occupied</span>
                    </div>
                    <span class="text-text-primary font-medium text-right tabular-nums">{{ occupied }}</span>
                    <span class="text-text-primary font-medium text-right tabular-nums min-w-[5ch]">{{ occupiedPercentage }}</span>
                </li>

                <li class="flex items-center gap-4 w-full text-body-md">
                    <div class="flex items-center gap-2 text-text-primary flex-1">
                        <span class="w-2.5 h-2.5 rounded-full bg-neutral-900 shrink-0" aria-hidden="true"></span>
                        <span class="font-medium">Available</span>
                    </div>
                    <span class="text-text-primary font-medium text-right tabular-nums">{{ available }}</span>
                    <span class="text-text-primary font-medium text-right tabular-nums min-w-[5ch]">{{ availablePercentage }}</span>
                </li>
            </ul>
        </div>
    </DashboardBaseCard>
</template>
