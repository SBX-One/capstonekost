import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
    {
        path: '/',
        component: () => import('@/components/layouts/PublicLayout.vue'),
        children: [
            {
                path: '',
                name: 'landing',
                component: () => import('@/views/HomeView.vue'),
                meta: { showSearchInNavbar: false }
            },
            {
                path: 'rooms',
                name: 'public-rooms',
                component: () => import('@/views/PublicBrowseView.vue'),
                meta: { showSearchInNavbar: true }
            },
            {
                path: 'rooms/:id',
                name: 'tenant-room-detail',
                component: () => import('@/views/PublicRoomDetailView.vue'),
                meta: { showSearchInNavbar: false },
                props: true
            }
        ]
    },

    {
        path: '/auth',
        component: () => import('@/components/layouts/AuthLayout.vue'),
        children: [
            {
                path: '/login',
                name: 'login',
                component: () => import('@/views/auth/LoginView.vue')
            },
            {
                path: '/register',
                name: 'register',
                component: () => import('@/views/auth/RegisterView.vue')
            }
        ]
    },

    {
        path: '/admin',
        component: () => import('@/components/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true, role: 'admin' },
        children: [
            {
                path: '',
                redirect: { name: 'admin-dashboard' }
            },
            {
                path: 'dashboard',
                name: 'admin-dashboard',
                component: () => import('@/views/admin/DashboardView.vue')
            },
            {
                path: 'rooms',
                name: 'admin-rooms',
                component: () => import('@/views/admin/RoomManagementView.vue')
            },
            {
                path: 'rooms/add',
                name: 'admin-room-add',
                component: () => import('@/views/admin/AddRoomView.vue')
            },
            {
                path: 'rooms/edit/:id',
                name: 'admin-room-edit',
                component: () => import('@/views/admin/EditRoomView.vue'),
                props: true
            },
        ]
    },

    {
        path: '/tenant',
        meta: { requiresAuth: true, role: 'tenant' },
        children: [
            {
                path: '',
                redirect: { name: 'tenant-dashboard' }
            },
            {
                path: 'dashboard',
                name: 'tenant-dashboard',
                // component: () => import('@/views/tenant/DashboardView.vue')
            },
            {
                path: 'my-room',
                name: 'tenant-my-room',
                // component: () => import('@/views/tenant/MyRoomView.vue')
            },
            {
                path: 'payments',
                name: 'tenant-payments',
                // component: () => import('@/views/tenant/PaymentHistoryView.vue')
            },
            {
                path: 'complaints',
                name: 'tenant-complaints',
                // component: () => import('@/views/tenant/ComplaintView.vue')
            }
        ]
    },

    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        // component: () => import('@/views/errors/NotFoundView.vue')
        redirect: '/'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, from, savedPosition) {
        if (to.hash) {
            return {
                el: to.hash,
                behavior: 'smooth',
            }
        }
        if (savedPosition) {
            return savedPosition;
        }
        return { top: 0, behavior: 'smooth' };
    }
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()
    const isAuthenticated = authStore.isAuthenticated
    const userRole = authStore.userRole

    if (to.meta.requiresAuth && !isAuthenticated) {
        return next({ name: 'login' })
    }

    if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
        return next(userRole === 'admin' ? { name: 'admin-dashboard' } : { name: 'tenant-dashboard' })
    }

    if (to.meta.role && userRole !== to.meta.role) {
        return next(userRole === 'admin' ? { name: 'admin-dashboard' } : { name: 'tenant-dashboard' })
    }

    next()
})

export default router