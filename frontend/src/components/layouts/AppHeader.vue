<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useRoomFilter } from '@/composables/useRoomFilter';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const authStore = useAuthStore();

const pageTitle = computed(() => {
    return route.meta.title || 'Dashboard';
});

const showSearch = computed(() => {
    return route.name === 'admin-rooms';
});

const { search } = useRoomFilter();
const adminName = computed(() => authStore.user?.name || 'Super Admin');
const adminRole = computed(() => {
    const role = authStore.user?.role || authStore.userRole;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Admin';
});

const adminInitials = computed(() => {
    const name = adminName.value;
    const parts = name.split(' ');
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
});

const adminAvatar = computed(() => authStore.user?.avatar || null);
</script>

<template>
    <header class="h-1000 bg-neutral-50 border-b border-border-default px-600 flex items-center justify-between sticky top-0 z-20">
        <div>
            <h2 class="text-h3 text-text-primary tracking-tight">{{ pageTitle }}</h2>
            <p class="text-body-sm text-text-secondary">Welcome back to Kosanmu admin panel.</p>
        </div>

        <div class="flex items-center gap-400">
            <div v-if="showSearch" class="relative hidden md:block w-72 transition-all duration-300">
                <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-secondary">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M18 10C18 5.59 14.41 2 10 2C5.59 2 2 5.59 2 10C2 14.41 5.59 18 10 18C11.85 18 13.54 17.37 14.9 16.31L20 21.41L21.41 20L16.31 14.9C17.4015 13.4995 17.9961 11.7756 18 10ZM4 10C4 6.69 6.69 4 10 4C13.31 4 16 6.69 16 10C16 13.31 13.31 16 10 16C6.69 16 4 13.31 4 10Z"
                            fill="currentColor"
                        />
                    </svg>
                </span>
                <input
                    v-model="search"
                    type="text"
                    placeholder="Search rooms..."
                    class="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-border-default rounded-default text-body-md focus:outline-none focus:border-border-focus transition-colors"
                />
            </div>

            <div class="flex items-center gap-3 pl-4 border-l border-border-default select-none">
                <div
                    class="w-10 h-10 rounded-full border border-border-default bg-action-primary text-text-inverse font-bold text-xs shadow-default flex items-center justify-center overflow-hidden shrink-0"
                >
                    <img v-if="adminAvatar" :src="adminAvatar" :alt="adminName" class="w-full h-full object-cover" />
                    <span v-else class="leading-none text-center">{{ adminInitials }}</span>
                </div>
                <div class="hidden lg:block text-left leading-tight">
                    <p class="text-body-sm font-bold text-text-primary">{{ adminName }}</p>
                    <p class="text-[11px] text-text-secondary">{{ adminRole }}</p>
                </div>
            </div>
        </div>
    </header>
</template>
