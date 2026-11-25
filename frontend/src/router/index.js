import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Kost Management';

const ROLE_HOME_ROUTE = Object.freeze({
    admin: 'admin-dashboard',
    tenant: 'tenant-dashboard',
});

const routes = [
    {
        path: '/',
        component: () => import('@/components/layouts/PublicLayout.vue'),
        children: [
            {
                path: '',
                name: 'landing',
                component: () => import('@/views/HomeView.vue'),
                meta: {
                    title: 'Home',
                    showSearchInNavbar: false,
                },
            },
            {
                path: 'rooms',
                name: 'public-rooms',
                component: () => import('@/views/PublicBrowseView.vue'),
                meta: {
                    title: 'Browse Rooms',
                    showSearchInNavbar: true,
                },
            },
            {
                path: 'rooms/:id(\\d+)',
                name: 'tenant-room-detail',
                component: () => import('@/views/PublicRoomDetailView.vue'),
                meta: {
                    title: 'Room Details',
                    showSearchInNavbar: false,
                },
                props: true,
            },
        ],
    },

    {
        path: '/auth',
        component: () => import('@/components/layouts/AuthLayout.vue'),
        meta: { guestOnly: true },
        children: [
            {
                path: '/login',
                name: 'login',
                component: () => import('@/views/auth/LoginView.vue'),
                meta: { title: 'Sign In' },
            },
            {
                path: '/register',
                name: 'register',
                component: () => import('@/views/auth/RegisterView.vue'),
                meta: { title: 'Create Account' },
            },
        ],
    },

    {
        path: '/admin',
        component: () => import('@/components/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, role: 'admin' },
        children: [
            {
                path: '',
                redirect: { name: 'admin-dashboard' },
            },
            {
                path: 'dashboard',
                name: 'admin-dashboard',
                component: () => import('@/views/admin/DashboardView.vue'),
                meta: { title: 'Admin Dashboard' },
            },
            {
                path: 'rooms',
                name: 'admin-rooms',
                component: () => import('@/views/admin/RoomManagementView.vue'),
                meta: {
                    title: 'Room Management',
                    showSearchInHeader: true,
                },
            },
            {
                path: 'rooms/add',
                name: 'admin-room-add',
                component: () => import('@/views/admin/AddRoomView.vue'),
                meta: { title: 'Add New Room' },
            },
            {
                path: 'rooms/edit/:id(\\d+)',
                name: 'admin-room-edit',
                component: () => import('@/views/admin/EditRoomView.vue'),
                meta: { title: 'Edit Room' },
                props: true,
            },
            {
                path: 'bookings',
                name: 'admin-bookings',
                component: () => import('@/views/admin/BookingManagementView.vue'),
                meta: { title: 'Booking Management' },
            },
            {
                path: 'payments',
                name: 'admin-payments',
                component: () => import('@/views/admin/PaymentManagementView.vue'),
                meta: { title: 'Payment Management' },
            },
            {
                path: 'payments/record',
                name: 'admin-payment-record',
                component: () => import('@/views/admin/RecordPaymentView.vue'),
                meta: { title: 'Record Payment' },
            },
            {
                path: 'complaints',
                name: 'admin-complaints',
                component: () => import('@/views/admin/AdminComplaintView.vue'),
                meta: { title: 'Reported Issues' },
            },
        ],
    },

    {
        path: '/tenant',
        component: () => import('@/components/layouts/TenantLayout.vue'),
        meta: { requiresAuth: true, role: 'tenant' },
        children: [
            {
                path: '',
                redirect: { name: 'tenant-dashboard' },
            },
            {
                path: 'dashboard',
                name: 'tenant-dashboard',
                component: () => import('@/views/tenant/DashboardView.vue'),
                meta: { title: 'Tenant Dashboard' },
            },
            {
                path: 'booking/:id(\\d+)',
                name: 'tenant-booking-request',
                component: () => import('@/views/tenant/BookingRequestView.vue'),
                meta: { title: 'Book a Room' },
                props: true,
            },
            {
                path: 'booking',
                name: 'tenant-bookings',
                component: () => import('@/views/tenant/TenantBookingView.vue'),
                meta: {
                    title: 'My Bookings',
                    showSearchInHeader: true,
                },
            },
            {
                path: 'payments',
                name: 'tenant-payments',
                component: () => import('@/views/tenant/PaymentOverviewView.vue'),
                meta: { title: 'My Payments' },
            },
            {
                path: 'payments/current/:id(\\d+)',
                name: 'tenant-payment-current',
                component: () => import('@/views/tenant/CurrentPaymentView.vue'),
                meta: { title: 'Payment Details' },
                props: true,
            },
            {
                path: 'complaints',
                name: 'tenant-complaints',
                component: () => import('@/views/tenant/ComplaintView.vue'),
                meta: { title: 'My Reported Issues' },
            },
            {
                path: 'complaints/create',
                name: 'tenant-complaint-create',
                component: () => import('@/views/tenant/CreateComplaintView.vue'),
                meta: { title: 'Report an Issue' },
            },
        ],
    },

    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        redirect: { name: 'landing' },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            };
        }
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0, behavior: 'smooth' };
    },
});

router.beforeEach(to => {
    const authStore = useAuthStore();
    const isAuthenticated = Boolean(authStore.isAuthenticated);
    const userRole = authStore.userRole;
    const roleHomeName = ROLE_HOME_ROUTE[userRole] || null;

    const requiresAuth = to.matched.some(record => record.meta?.requiresAuth);
    const isGuestOnly = to.matched.some(record => record.meta?.guestOnly);
    const requiredRole = [...to.matched].reverse().find(record => record.meta?.role)?.meta?.role;

    if (requiresAuth && !isAuthenticated) {
        return {
            name: 'login',
            query: { redirect: to.fullPath },
        };
    }

    if (isGuestOnly && isAuthenticated && roleHomeName) {
        return { name: roleHomeName };
    }

    if (requiresAuth && requiredRole && userRole !== requiredRole) {
        return roleHomeName ? { name: roleHomeName } : { name: 'landing' };
    }

    return true;
});

router.afterEach(to => {
    const pageTitle = [...to.matched].reverse().find(record => record.meta?.title)?.meta?.title;
    document.title = pageTitle ? `${pageTitle} — ${APP_NAME}` : APP_NAME;
});

export default router;