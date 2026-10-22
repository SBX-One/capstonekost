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
        const rawResponse = response.data
        const authData = rawResponse?.data || rawResponse || {}

        return authData
    }

    async function login(credentials) {
        const response = await apiClient.post('/login', credentials)
        const rawResponse = response.data
        const authData = rawResponse?.data || rawResponse || {}

        if (authData.token) setToken(authData.token)
        if (authData.user) setUser(authData.user)

        return authData
    }

    async function refreshToken() {
        const response = await apiClient.post('/refresh')
        const rawResponse = response.data
        const authData = rawResponse?.data || rawResponse || {}

        if (authData.token) {
            setToken(authData.token)
            return authData.token
        }

        throw new Error('Refresh failed: No valid token received from server.')
    }

    async function logout() {
        try {
            if (token.value) {
                await apiClient.post('/logout')
            }
        } catch (err) {
            console.warn('Logout failed on server or session already expired:', err?.response?.data?.message || err.message || err)
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