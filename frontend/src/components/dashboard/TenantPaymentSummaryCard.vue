<script setup>
import { computed } from 'vue';

const props = defineProps({
    totalAmount: {
        type: Number,
        default: 0,
    },
    payments: {
        type: Array,
        default: () => [],
    },
});

const formatRupiah = number => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(number);
};

const formatDate = dateString => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' }).toLowerCase();
    const year = date.getFullYear().toString().slice(-2);
    return `${day} ${month} ${year}`;
};

const flattenedPayments = computed(() => {
    if (!Array.isArray(props.payments) || props.payments.length === 0) {
        return [];
    }

    const result = props.payments.flatMap(roomGroup => {
        if (!Array.isArray(roomGroup?.payments)) return [];

        return roomGroup.payments.map(payment => ({
            id: payment?.id ?? `fallback-${Math.random()}`,
            roomName: roomGroup?.room?.name || 'Unknown Room',
            amount: Number(payment?.amount) || 0,
            date: payment?.created_at || null,
        }));
    });

    return result
        .sort((a, b) => {
            const timeA = new Date(a.date).getTime();
            const timeB = new Date(b.date).getTime();

            const safeTimeA = Number.isNaN(timeA) ? 0 : timeA;
            const safeTimeB = Number.isNaN(timeB) ? 0 : timeB;

            return safeTimeB - safeTimeA;
        })
        .slice(0, 5);
});
</script>

<template>
    <template v-if="flattenedPayments.length > 0">
        <div class="bg-neutral-100 rounded-default p-2 flex flex-col gap-4 justify-between w-full">
            <div class="flex flex-col gap-3 px-4 py-3 bg-bg-default rounded-default">
                <div class="w-10 h-10 rounded-full bg-surface-default flex items-center justify-center">
                    <svg class="w-3 h-2 text-text-primary" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M8.625 6.75C8.52554 6.75 8.43016 6.78951 8.35983 6.85983C8.28951 6.93016 8.25 7.02554 8.25 7.125C8.25 7.22446 8.28951 7.31984 8.35983 7.39017C8.43016 7.46049 8.52554 7.5 8.625 7.5H10.125C10.2245 7.5 10.3198 7.46049 10.3902 7.39017C10.4605 7.31984 10.5 7.22446 10.5 7.125C10.5 7.02554 10.4605 6.93016 10.3902 6.85983C10.3198 6.78951 10.2245 6.75 10.125 6.75H8.625ZM0 2.0625C0 1.51549 0.217299 0.990886 0.604092 0.604092C0.990886 0.217298 1.51549 0 2.0625 0H9.9375C10.4845 0 11.0091 0.217298 11.3959 0.604092C11.7827 0.990886 12 1.51549 12 2.0625V6.9375C12 7.48451 11.7827 8.00911 11.3959 8.39591C11.0091 8.7827 10.4845 9 9.9375 9H2.0625C1.51549 9 0.990886 8.7827 0.604092 8.39591C0.217299 8.00911 0 7.48451 0 6.9375V2.0625ZM2.0625 0.75C1.7144 0.75 1.38056 0.888281 1.13442 1.13442C0.888281 1.38056 0.75 1.7144 0.75 2.0625V3H11.25V2.0625C11.25 1.7144 11.1117 1.38056 10.8656 1.13442C10.6194 0.888281 10.2856 0.75 9.9375 0.75H2.0625ZM11.25 3.75H0.75V6.9375C0.75 7.662 1.338 8.25 2.0625 8.25H9.9375C10.2856 8.25 10.6194 8.11172 10.8656 7.86558C11.1117 7.61944 11.25 7.2856 11.25 6.9375V3.75Z"
                            fill="currentColor"
                        />
                    </svg>
                </div>

                <h3 class="text-h3 text-text-primary tracking-tight">
                    {{ formatRupiah(totalAmount) }}
                </h3>
                <p class="text-body-md text-text-secondary">Total Rent Paid</p>
            </div>

            <div class="flex flex-col gap-4 flex-1">
                <div v-for="item in flattenedPayments" :key="item.id" class="flex items-start justify-between gap-4 px-2 py-3 bg-bg-default rounded-default">
                    <div class="flex items-start gap-2">
                        <div class="w-6 h-6 rounded-full bg-surface-default flex items-center justify-center mt-1">
                            <svg class="w-2 h-2 text-text-primary" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0 1C0 0.734784 0.105357 0.48043 0.292893 0.292893C0.48043 0.105357 0.734784 0 1 0H5.18182C5.31314 0 5.44318 0.0258658 5.5645 0.0761205C5.68583 0.126375 5.79607 0.200035 5.88893 0.292893C5.98178 0.385752 6.05544 0.495991 6.1057 0.617317C6.15595 0.738642 6.18182 0.868678 6.18182 1V5.09091H8V6.63636C8 6.99802 7.85633 7.34487 7.6006 7.6006C7.34487 7.85633 6.99802 8 6.63636 8H1.36364C1.00198 8 0.655131 7.85633 0.3994 7.6006C0.143668 7.34487 0 6.99802 0 6.63636V1ZM6.18182 7.45455H6.63636C6.85336 7.45455 7.06147 7.36834 7.21491 7.21491C7.36834 7.06147 7.45455 6.85336 7.45455 6.63636V5.63636H6.18182V7.45455ZM1 0.545455C0.749091 0.545455 0.545455 0.749091 0.545455 1V6.63636C0.545455 6.85336 0.631656 7.06147 0.785095 7.21491C0.938533 7.36834 1.14664 7.45455 1.36364 7.45455H5.63636V1C5.63636 0.749091 5.43273 0.545455 5.18182 0.545455H1ZM1.72727 1.81818C1.65494 1.81818 1.58557 1.84692 1.53443 1.89806C1.48328 1.94921 1.45455 2.01858 1.45455 2.09091C1.45455 2.16324 1.48328 2.23261 1.53443 2.28376C1.58557 2.3349 1.65494 2.36364 1.72727 2.36364H4.45455C4.52688 2.36364 4.59625 2.3349 4.64739 2.28376C4.69854 2.23261 4.72727 2.16324 4.72727 2.09091C4.72727 2.01858 4.69854 1.94921 4.64739 1.89806C4.59625 1.84692 4.52688 1.81818 4.45455 1.81818H1.72727ZM1.45455 3.90909C1.45455 3.83676 1.48328 3.76739 1.53443 3.71624C1.58557 3.6651 1.65494 3.63636 1.72727 3.63636H4.45455C4.52688 3.63636 4.59625 3.6651 4.64739 3.71624C4.69854 3.76739 4.72727 3.83676 4.72727 3.90909C4.72727 3.98142 4.69854 4.05079 4.64739 4.10194C4.59625 4.15308 4.52688 4.18182 4.45455 4.18182H1.72727C1.65494 4.18182 1.58557 4.15308 1.53443 4.10194C1.48328 4.05079 1.45455 3.98142 1.45455 3.90909ZM1.72727 5.45455C1.65494 5.45455 1.58557 5.48328 1.53443 5.53443C1.48328 5.58557 1.45455 5.65494 1.45455 5.72727C1.45455 5.7996 1.48328 5.86897 1.53443 5.92012C1.58557 5.97127 1.65494 6 1.72727 6H3C3.07233 6 3.1417 5.97127 3.19285 5.92012C3.24399 5.86897 3.27273 5.7996 3.27273 5.72727C3.27273 5.65494 3.24399 5.58557 3.19285 5.53443C3.1417 5.48328 3.07233 5.45455 3 5.45455H1.72727Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>
                        <div class="flex flex-col">
                            <span class="text-body-md text-text-primary">Room {{ item.roomName }}</span>
                            <span class="text-body-sm text-text-secondary">paid on {{ formatDate(item.date) }}</span>
                        </div>
                    </div>
                    <div class="text-body-md text-text-primary text-right whitespace-nowrap">
                        {{ formatRupiah(item.amount) }}
                    </div>
                </div>
            </div>
        </div>
    </template>

    <template v-else>
        <div class="bg-neutral-100 flex flex-col items-center justify-center gap-6 px-8 py-16 rounded-default">
            <div class="w-20 h-20 rounded-full bg-bg-default flex items-center justify-center">
                <svg class="w-10 h-10 text-text-secondary" viewBox="0 0 12 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M8.625 6.75C8.52554 6.75 8.43016 6.78951 8.35983 6.85983C8.28951 6.93016 8.25 7.02554 8.25 7.125C8.25 7.22446 8.28951 7.31984 8.35983 7.39017C8.43016 7.46049 8.52554 7.5 8.625 7.5H10.125C10.2245 7.5 10.3198 7.46049 10.3902 7.39017C10.4605 7.31984 10.5 7.22446 10.5 7.125C10.5 7.02554 10.4605 6.93016 10.3902 6.85983C10.3198 6.78951 10.2245 6.75 10.125 6.75H8.625ZM0 2.0625C0 1.51549 0.217299 0.990886 0.604092 0.604092C0.990886 0.217298 1.51549 0 2.0625 0H9.9375C10.4845 0 11.0091 0.217298 11.3959 0.604092C11.7827 0.990886 12 1.51549 12 2.0625V6.9375C12 7.48451 11.7827 8.00911 11.3959 8.39591C11.0091 8.7827 10.4845 9 9.9375 9H2.0625C1.51549 9 0.990886 8.7827 0.604092 8.39591C0.217299 8.00911 0 7.48451 0 6.9375V2.0625ZM2.0625 0.75C1.7144 0.75 1.38056 0.888281 1.13442 1.13442C0.888281 1.38056 0.75 1.7144 0.75 2.0625V3H11.25V2.0625C11.25 1.7144 11.1117 1.38056 10.8656 1.13442C10.6194 0.888281 10.2856 0.75 9.9375 0.75H2.0625ZM11.25 3.75H0.75V6.9375C0.75 7.662 1.338 8.25 2.0625 8.25H9.9375C10.2856 8.25 10.6194 8.11172 10.8656 7.86558C11.1117 7.61944 11.25 7.2856 11.25 6.9375V3.75Z"
                        fill="currentColor"
                    />
                </svg>
            </div>
            <p class="text-body-lg text-text-secondary text-center">Your payment records will show up here.</p>
        </div>
    </template>
</template>
