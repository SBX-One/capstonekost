<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DashboardBaseCard from '@/components/dashboard/DashboardBaseCard.vue';
import DashboardMetricCard from '@/components/dashboard/DashboardMetricCard.vue';
import RoomOccupancyChart from '@/components/dashboard/RoomOccupancyChart.vue';
import BookingStatusChart from '@/components/dashboard/BookingStatusChart.vue';
import AdminBookingTable from '@/components/booking/AdminBookingTable.vue';

const router = useRouter();
const isLoading = ref(true);
const dashboardData = ref(null);
const recentBookings = ref([]);

const fetchDashboardData = async () => {
    isLoading.value = true;

    try {
        await new Promise(resolve => setTimeout(resolve, 800));

        const dummyResponse = {
            metrics: {
                total_rooms: 27,
                active_bookings: 12,
                payments_this_month: 12500000,
            },
            room_occupancy: {
                total: 27,
                occupied: 9,
                available: 18,
            },
            booking_status_overview: {
                pending: 4,
                active: 12,
                completed: 3,
                rejected: 1,
            },
            recent_bookings: [
                {
                    id: 1,
                    booking_records: {
                        room_name: 'B-05',
                        move_in: '2026-10-08T00:00:00.000000Z',
                        move_out: '2026-12-08T00:00:00.000000Z',
                        rental_duration: 2,
                        total: 2400000,
                        status: 'pending',
                    },
                    booking_contacts: {
                        name: 'Stipen Steven',
                        email: 'stipensteven@gmail.com',
                        phone: '-',
                    },
                },
                {
                    id: 2,
                    booking_records: {
                        room_name: 'B-05',
                        move_in: '2026-12-09T00:00:00.000000Z',
                        move_out: '2027-02-09T00:00:00.000000Z',
                        rental_duration: 3,
                        total: 3600000,
                        status: 'pending',
                    },
                    booking_contacts: {
                        name: 'Albin',
                        email: 'albin@gmail.com',
                        phone: '-',
                    },
                },
                {
                    id: 3,
                    booking_records: {
                        room_name: 'C-02',
                        move_in: '2026-11-03T00:00:00.000000Z',
                        move_out: '2027-11-03T00:00:00.000000Z',
                        rental_duration: 12,
                        total: 17400000,
                        status: 'cancelled',
                    },
                    booking_contacts: {
                        name: 'Wisnu',
                        email: 'wisnu@gmail.com',
                        phone: '-',
                    },
                },
                {
                    id: 4,
                    booking_records: {
                        room_name: 'C-08',
                        move_in: '2026-11-01T00:00:00.000000Z',
                        move_out: '2027-04-01T00:00:00.000000Z',
                        rental_duration: 5,
                        total: 12250000,
                        status: 'rejected',
                    },
                    booking_contacts: {
                        name: 'Budi',
                        email: 'budi@gmail.com',
                        phone: '-',
                    },
                },
            ],
        };

        dashboardData.value = dummyResponse;
        recentBookings.value = dummyResponse.recent_bookings || [];
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
    } finally {
        isLoading.value = false;
    }
};

const formatRupiah = number => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(number);
};

const goToPage = routeName => {
    router.push({ name: routeName });
};

onMounted(() => {
    fetchDashboardData();
});
</script>

<template>
    <div class="max-w-7xl mx-auto min-h-screen">
        <header class="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-16">
            <div class="flex flex-col gap-1">
                <h1 class="text-h2 text-text-primary tracking-tight">Dashboard Overview</h1>
                <p class="text-body-lg text-text-secondary">Monitor room occupancy, booking activity, and monthly payments at a glance</p>
            </div>

            <button class="flex items-center gap-4 p-3 border border-border-default rounded-default text-h5 text-text-primary hover:bg-neutral-200 transition-colors focus:outline-none cursor-pointer">
                <svg class="w-6 h-6 text-text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_3645_38471)">
                        <path
                            d="M22 2.2505H18.75V0.7505C18.7501 0.551588 18.6712 0.36077 18.5307 0.220024C18.3901 0.0792776 18.1994 0.000132786 18.0005 1.78083e-07C17.8016 -0.00013243 17.6108 0.078758 17.47 0.219317C17.3293 0.359875 17.2501 0.550588 17.25 0.7495V2.2505H12.75V0.7505C12.7501 0.652009 12.7307 0.554469 12.6931 0.46345C12.6555 0.37243 12.6003 0.289714 12.5307 0.220024C12.4611 0.150333 12.3784 0.0950335 12.2875 0.0572819C12.1965 0.0195302 12.099 6.58278e-05 12.0005 1.66907e-07C11.8016 -0.000132441 11.6108 0.078758 11.47 0.219317C11.3293 0.359875 11.2501 0.550588 11.25 0.7495V2.2505H6.75V0.7505C6.75007 0.652009 6.73073 0.554469 6.6931 0.46345C6.65547 0.37243 6.60028 0.289714 6.53068 0.220024C6.46109 0.150333 6.37844 0.0950335 6.28747 0.0572819C6.19651 0.0195302 6.09899 6.58278e-05 6.0005 1.66907e-07C5.80159 -0.000132441 5.61077 0.078758 5.47002 0.219317C5.32928 0.359875 5.25013 0.550588 5.25 0.7495V2.2505H2C1.46974 2.2505 0.961184 2.46108 0.58614 2.83593C0.211096 3.21079 0.00026513 3.71924 0 4.2495V21.9995C0 22.5299 0.210714 23.0386 0.585786 23.4137C0.960859 23.7888 1.46957 23.9995 2 23.9995H22C22.5304 23.9995 23.0391 23.7888 23.4142 23.4137C23.7893 23.0386 24 22.5299 24 21.9995V4.2495C23.9997 3.71924 23.7889 3.21079 23.4139 2.83593C23.0388 2.46108 22.5303 2.2505 22 2.2505ZM22.5 22.0005C22.5 22.1329 22.4475 22.26 22.3539 22.3537C22.2604 22.4474 22.1334 22.5002 22.001 22.5005H2C1.86739 22.5005 1.74021 22.4478 1.64645 22.3541C1.55268 22.2603 1.5 22.1331 1.5 22.0005V4.2505C1.50026 4.11807 1.55306 3.99115 1.6468 3.89759C1.74054 3.80404 1.86756 3.7515 2 3.7515H5.25V5.2515C5.24987 5.45041 5.32876 5.64123 5.46932 5.78198C5.60988 5.92272 5.80059 6.00187 5.9995 6.002C6.19841 6.00213 6.38923 5.92324 6.52998 5.78268C6.67072 5.64213 6.74987 5.45141 6.75 5.2525V3.7515H11.25V5.2515C11.2499 5.45041 11.3288 5.64123 11.4693 5.78198C11.6099 5.92272 11.8006 6.00187 11.9995 6.002C12.1984 6.00213 12.3892 5.92324 12.53 5.78268C12.6707 5.64213 12.7499 5.45141 12.75 5.2525V3.7515H17.25V5.2515C17.2499 5.45041 17.3288 5.64123 17.4693 5.78198C17.6099 5.92272 17.8006 6.00187 17.9995 6.002C18.1984 6.00213 18.3892 5.92324 18.53 5.78268C18.6707 5.64213 18.7499 5.45141 18.75 5.2525V3.7515H22C22.1323 3.75176 22.259 3.80442 22.3526 3.89795C22.4461 3.99147 22.4987 4.11824 22.499 4.2505L22.5 22.0005Z"
                            fill="currentColor"
                        />
                        <path
                            d="M5.25 9H8.25V11.25H5.25V9ZM5.25 12.75H8.25V15H5.25V12.75ZM5.25 16.5H8.25V18.75H5.25V16.5ZM10.5 16.5H13.5V18.75H10.5V16.5ZM10.5 12.75H13.5V15H10.5V12.75ZM10.5 9H13.5V11.25H10.5V9ZM15.75 16.5H18.75V18.75H15.75V16.5ZM15.75 12.75H18.75V15H15.75V12.75ZM15.75 9H18.75V11.25H15.75V9Z"
                            fill="currentColor"
                        />
                    </g>
                    <defs>
                        <clipPath id="clip0_3645_38471">
                            <rect width="24" height="24" fill="currentColor" />
                        </clipPath>
                    </defs>
                </svg>

                October 2026
            </button>
        </header>

        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20 gap-4">
            <svg class="animate-spin h-8 w-8 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p class="text-body-md text-text-secondary">Loading dashboard data...</p>
        </div>

        <template v-else-if="dashboardData">
            <section class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <DashboardMetricCard label="TOTAL ROOMS" :value="dashboardData.metrics.total_rooms" description="Registered rooms" @click-action="goToPage('admin-rooms')" />
                <DashboardMetricCard label="ACTIVE BOOKINGS" :value="dashboardData.metrics.active_bookings" description="Currently active" @click-action="goToPage('admin-bookings')" />
                <DashboardMetricCard
                    label="PAYMENTS THIS MONTH"
                    :value="formatRupiah(dashboardData.metrics.payments_this_month)"
                    description="October 2026"
                    @click-action="goToPage('admin-payments')"
                />
            </section>

            <section class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <RoomOccupancyChart :total-rooms="dashboardData.room_occupancy.total" :occupied="dashboardData.room_occupancy.occupied" :available="dashboardData.room_occupancy.available" />
                <BookingStatusChart
                    :pending="dashboardData.booking_status_overview.pending"
                    :active="dashboardData.booking_status_overview.active"
                    :completed="dashboardData.booking_status_overview.completed"
                    :rejected="dashboardData.booking_status_overview.rejected"
                />
            </section>

            <section>
                <DashboardBaseCard title="Recent Bookings" subtitle="Latest bookings requests and their current status">
                    <template #action>
                        <button
                            @click="goToPage('admin-bookings')"
                            class="flex items-center gap-4 p-3 bg-bg-default border border-border-default rounded-default text-h5 text-text-primary hover:bg-neutral-200 transition-colors focus:outline-none cursor-pointer"
                        >
                            View all bookings
                            <svg class="w-2 h-3.5" width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 13L7 7L1 1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" />
                            </svg>
                        </button>
                    </template>

                    <AdminBookingTable
                        :bookings="recentBookings"
                        variant="dashboard"
                        :is-loading="false"
                        @view="
                            booking => {
                                console.log('View detail:', booking.id);
                            }
                        "
                    />

                    <template #footer>
                        <p class="text-body-md text-text-secondary">Showing {{ recentBookings.length }} of the latest bookings</p>
                    </template>
                </DashboardBaseCard>
            </section>
        </template>
    </div>
</template>
