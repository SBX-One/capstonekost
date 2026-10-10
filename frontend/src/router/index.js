import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes = [
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/auth/LoginView.vue')
    },
    {
        path: '/register',
        name: 'register',
        component: () => import('@/views/auth/RegisterView.vue')
    },
    {
        path: '/admin/dashboard',
        name: 'admin-dashboard',
        component: () => import('@/views/admin/Dashboard.vue'),
        meta: { requiresAuth: true, role: 'admin' }
    },
    {
        path: '/tenant/dashboard',
        name: 'tenant-dashboard',
        component: () => import('@/views/tenant/Dashboard.vue'),
        meta: { requiresAuth: true, role: 'tenant' }
    }
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
        return next(authStore.userRole === 'admin' ? '/admin/dashboard' : '/tenant/dashboard')
    }

    if (to.meta.role && authStore.userRole !== to.meta.role) {
        return next(authStore.userRole === 'admin' ? '/admin/dashboard' : '/tenant/dashboard')
    }

    next()
})

export default router