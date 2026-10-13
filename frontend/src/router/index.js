import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
    {
        path: '/',
        component: () => import('@/components/layouts/AuthLayout.vue'),
        redirect: { name: 'login' },
        children: [
            {
                path: 'login',
                name: 'login',
                component: () => import('@/views/auth/LoginView.vue')
            },
            {
                path: 'register',
                name: 'register',
                component: () => import('@/views/auth/RegisterView.vue')
            }
        ]
    },
    {
        path: '/login',
        redirect: { name: 'login' }
    },
    {
        path: '/register',
        redirect: { name: 'register' }
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

            },
            {
                path: 'my-room',
                name: 'tenant-my-room',

            },
            {
                path: 'payments',
                name: 'tenant-payments',

            },
            {
                path: 'complaints',
                name: 'tenant-complaints',

            }
        ]
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return next({ name: 'login' })
    }

    if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
        return next(authStore.userRole === 'admin' ? { name: 'admin-dashboard' } : { name: 'tenant-dashboard' })
    }

    if (to.meta.role && authStore.userRole !== to.meta.role) {
        return next(authStore.userRole === 'admin' ? { name: 'admin-dashboard' } : { name: 'tenant-dashboard' })
    }

    next()
})

export default router