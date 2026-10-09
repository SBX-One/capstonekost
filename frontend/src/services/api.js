import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
        const tokenHeader = authStore.token.startsWith('Bearer ')
            ? authStore.token
            : `Bearer ${authStore.token}`
        config.headers.Authorization = tokenHeader
    }
    return config
}, (error) => Promise.reject(error))

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error)
        } else {
            promise.resolve(token)
        }
    })
    failedQueue = []
}

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config
        const authStore = useAuthStore()

        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes('/login') &&
            !originalRequest.url.includes('/register') &&
            !originalRequest.url.includes('/refresh')
        ) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = token
                        return apiClient(originalRequest)
                    })
                    .catch((err) => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                const newToken = await authStore.refreshToken()
                processQueue(null, newToken)

                originalRequest.headers.Authorization = newToken
                return apiClient(originalRequest)
            } catch (refreshError) {
                processQueue(refreshError, null)
                authStore.logout()
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export default apiClient