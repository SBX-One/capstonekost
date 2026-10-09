import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import apiClient from '@/services/api'

function readStoredUser() {
    try {
        const stored = JSON.parse(localStorage.getItem('user') || 'null')
        return typeof stored === 'object' && stored !== null ? stored : null
    } catch {
        localStorage.removeItem('user')
        return null
    }
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref(readStoredUser())
    const token = ref(localStorage.getItem('auth_token') || '')

    const isAuthenticated = computed(() => !!token.value)
    const userRole = computed(() => user.value?.role || 'tenant')

    async function register(payload) {
        const response = await apiClient.post('/register', payload)
        if (response.data.token) {
            setToken(response.data.token)
        }
        return response.data
    }

    async function login(credentials) {
        const response = await apiClient.post('/login', credentials)
        if (response.data.token) setToken(response.data.token)
        if (response.data.user) setUser(response.data.user)
        return response.data
    }

    async function refreshToken() {
        const response = await apiClient.post('/refresh')
        const newToken = response.data.token
        setToken(newToken)
        return newToken
    }

    async function logout() {
        try {
            if (token.value) {
                await apiClient.post('/logout')
            }
        } catch (err) {
            console.warn('Sesi habis atau server offline saat logout:', err)
        } finally {
            clearAuth()
            window.location.replace('/login')
        }
    }

    function setToken(newToken) {
        token.value = newToken
        localStorage.setItem('auth_token', newToken)
    }

    function setUser(newUser) {
        user.value = newUser
        localStorage.setItem('user', JSON.stringify(newUser))
    }

    function clearAuth() {
        user.value = null
        token.value = ''
        localStorage.removeItem('user')
        localStorage.removeItem('auth_token')
    }

    return {
        user,
        token,
        isAuthenticated,
        userRole,
        register,
        login,
        refreshToken,
        logout,
    }
})