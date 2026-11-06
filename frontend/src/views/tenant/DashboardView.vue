<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTenantDashboard } from '@/composables/useTenantDashboard';

import TenantHero from '@/components/common/TenantHero.vue';
import TenantMetricCard from '@/components/dashboard/TenantMetricCard.vue';
import TenantBookingCard from '@/components/booking/TenantBookingCard.vue';
import TenantPaymentSummaryCard from '@/components/dashboard/TenantPaymentSummaryCard.vue';

const router = useRouter();
const { dashboardData, isLoading, error, fetchDashboardData } = useTenantDashboard();

const formatRupiah = number => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(number || 0);
};

const navigateTo = routeName => {
    if (routeName) router.push({ name: routeName });
};

onMounted(() => {
    fetchDashboardData();
});
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen">
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-32 gap-4">
            <svg class="animate-spin h-10 w-10 text-action-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-body-lg text-text-secondary font-medium">Loading your space...</p>
        </div>

        <div v-else-if="error" class="flex flex-col items-center justify-center py-32 gap-4 animate-fade-in">
            <div class="w-16 h-16 bg-status-error-bg text-status-error rounded-full flex items-center justify-center mb-2">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
            <p class="text-body-lg text-text-primary font-bold">{{ error }}</p>
            <button @click="fetchDashboardData" class="px-6 py-2.5 bg-action-primary text-text-inverse rounded-default hover:bg-action-primary-hover transition-colors text-label-btn-md">
                Try Again
            </button>
        </div>

        <template v-else-if="dashboardData">
            <div class="mb-8">
                <TenantHero
                    label="OVERVIEW"
                    title="Welcome to Your Space."
                    subtitle="Your stay, organized and easy to manage, with everything you need to enjoy a comfortable living experience at KOSANMU."
                />
            </div>

            <section class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <TenantMetricCard icon-name="door" :value="`${dashboardData.metrics?.active_room || 0} Room${dashboardData.metrics?.active_room > 1 ? 's' : ''}`" label="Active Room" />
                <TenantMetricCard icon-name="clock" :value="`${dashboardData.metrics?.pending_room || 0} Room${dashboardData.metrics?.pending_room > 1 ? 's' : ''}`" label="Pending Room" />
                <TenantMetricCard icon-name="invoice" :value="formatRupiah(dashboardData.metrics?.this_month_bill_amount)" label="This Month's Bill" />
            </section>

            <section class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2 flex flex-col gap-4">
                    <header class="flex items-center justify-between pb-2 border-b border-border-default md:border-none md:pb-0">
                        <h2 class="text-body-md text-text-primary tracking-tight">Booking History</h2>
                        <button @click="navigateTo('tenant-bookings')" class="text-label-btn-md text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer">
                            See All
                            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M7.83333 16.2742C7.71628 16.1571 7.65054 15.9982 7.65054 15.8326C7.65054 15.667 7.71628 15.5081 7.83333 15.3909L13.1367 10.0876C13.1561 10.0682 13.1715 10.0452 13.182 10.0199C13.1925 9.99462 13.1979 9.96748 13.1979 9.94008C13.1979 9.91268 13.1925 9.88554 13.182 9.86023C13.1715 9.83492 13.1561 9.81193 13.1367 9.79258L7.83333 4.48925C7.72293 4.37077 7.66282 4.21406 7.66568 4.05215C7.66854 3.89023 7.73413 3.73574 7.84864 3.62123C7.96315 3.50672 8.11764 3.44113 8.27956 3.43827C8.44148 3.43541 8.59818 3.49551 8.71666 3.60591L14.02 8.90925C14.1554 9.04467 14.2629 9.20544 14.3362 9.38238C14.4095 9.55933 14.4472 9.74897 14.4472 9.9405C14.4472 10.132 14.4095 10.3217 14.3362 10.4986C14.2629 10.6756 14.1554 10.8363 14.02 10.9717L8.71666 16.2742C8.59947 16.3913 8.44062 16.457 8.27499 16.457C8.10937 16.457 7.95051 16.3913 7.83333 16.2742Z"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </header>

                    <div class="flex flex-col gap-4">
                        <template v-if="dashboardData.booking_history?.length > 0">
                            <TenantBookingCard v-for="booking in dashboardData.booking_history" :key="booking.id" :booking="booking" variant="dashboard" />
                        </template>
                        <div v-else class="p-10 h-full bg-surface-default rounded-default flex flex-col gap-6 items-center justify-center">
                            <div class="w-20 h-20 rounded-full bg-bg-default flex items-center justify-center">
                                <svg class="w-10 h-10 text-text-secondary" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M27.1076 19.9937C27.1076 20.24 27.0522 20.4838 26.9445 20.7113C26.8368 20.9388 26.679 21.1455 26.48 21.3196C26.281 21.4937 26.0447 21.6319 25.7847 21.7261C25.5247 21.8203 25.2461 21.8688 24.9646 21.8688C24.6832 21.8688 24.4045 21.8203 24.1445 21.7261C23.8845 21.6319 23.6483 21.4937 23.4493 21.3196C23.2503 21.1455 23.0924 20.9388 22.9848 20.7113C22.8771 20.4838 22.8216 20.24 22.8216 19.9937C22.8216 19.4964 23.0474 19.0195 23.4493 18.6679C23.8512 18.3162 24.3963 18.1187 24.9646 18.1187C25.533 18.1187 26.0781 18.3162 26.48 18.6679C26.8819 19.0195 27.1076 19.4964 27.1076 19.9937ZM18.8728 0.0278748C18.6646 -0.011241 18.4492 -0.00916523 18.2421 0.0339499C18.035 0.0770651 17.8415 0.16013 17.6758 0.277072C17.5101 0.394014 17.3764 0.541877 17.2844 0.709851C17.1924 0.877825 17.1444 1.06166 17.1441 1.24793V38.7496C17.144 38.936 17.1916 39.1202 17.2834 39.2885C17.3753 39.4567 17.5089 39.6049 17.6747 39.7221C17.8404 39.8394 18.034 39.9226 18.2414 39.9659C18.4487 40.0092 18.6644 40.0113 18.8728 39.9721L38.8742 36.2195C39.1937 36.1588 39.4798 36.0041 39.6847 35.7811C39.8896 35.5582 40.0009 35.2805 40 34.9944V4.99309C39.9994 4.70752 39.8871 4.43072 39.6818 4.20874C39.4765 3.98677 39.1904 3.83301 38.8713 3.77304L18.8728 0.0278748ZM20.0014 37.202V2.793L37.1455 6.00564V33.9869L20.0014 37.202ZM14.2924 37.4895V34.9894H2.85735V5.00059H14.2924V2.50048H1.42867C1.04977 2.50048 0.686377 2.63219 0.418449 2.86662C0.150521 3.10105 0 3.419 0 3.75054V36.2395C0 36.571 0.150521 36.889 0.418449 37.1234C0.686377 37.3578 1.04977 37.4895 1.42867 37.4895H14.2924Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                            <p class="text-body-lg text-text-secondary text-center">You haven't booked a room yet. Explore our available rooms to find the right space for you.</p>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-1 flex flex-col gap-4">
                    <header class="flex items-center justify-between pb-2 border-b border-border-default md:border-none md:pb-0">
                        <h2 class="text-body-md text-text-primary tracking-tight">Payment History</h2>
                        <button @click="navigateTo('tenant-payments')" class="text-label-btn-md text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1 cursor-pointer">
                            <svg class="w-5 h-5" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M7.83333 16.2742C7.71628 16.1571 7.65054 15.9982 7.65054 15.8326C7.65054 15.667 7.71628 15.5081 7.83333 15.3909L13.1367 10.0876C13.1561 10.0682 13.1715 10.0452 13.182 10.0199C13.1925 9.99462 13.1979 9.96748 13.1979 9.94008C13.1979 9.91268 13.1925 9.88554 13.182 9.86023C13.1715 9.83492 13.1561 9.81193 13.1367 9.79258L7.83333 4.48925C7.72293 4.37077 7.66282 4.21406 7.66568 4.05215C7.66854 3.89023 7.73413 3.73574 7.84864 3.62123C7.96315 3.50672 8.11764 3.44113 8.27956 3.43827C8.44148 3.43541 8.59818 3.49551 8.71666 3.60591L14.02 8.90925C14.1554 9.04467 14.2629 9.20544 14.3362 9.38238C14.4095 9.55933 14.4472 9.74897 14.4472 9.9405C14.4472 10.132 14.4095 10.3217 14.3362 10.4986C14.2629 10.6756 14.1554 10.8363 14.02 10.9717L8.71666 16.2742C8.59947 16.3913 8.44062 16.457 8.27499 16.457C8.10937 16.457 7.95051 16.3913 7.83333 16.2742Z"
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    fill="currentColor"
                                />
                            </svg>
                        </button>
                    </header>

                    <TenantPaymentSummaryCard :total-amount="dashboardData.payment_history?.total_amount_paid" :payments="dashboardData.payment_history?.payments" />
                </div>
            </section>
        </template>
    </div>
</template>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(12px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
