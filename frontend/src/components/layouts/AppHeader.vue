<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { watchDebounced } from '@vueuse/core';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const pageTitle = computed(() => route.meta.title || 'Dashboard');
const showSearch = computed(() => !!route.meta.showSearchInHeader);

const searchQuery = ref(route.query.search || '');

watchDebounced(
    searchQuery,
    async newVal => {
        const freshQuery = router.currentRoute.value.query;
        if (newVal === (freshQuery.search || '')) return;

        const query = { ...freshQuery };
        if (newVal.trim()) {
            query.search = newVal.trim();
        } else {
            delete query.search;
        }
        delete query.page;

        await router.replace({ query }).catch(() => {});
    },
    { debounce: 400 }
);

watch(
    () => route.query.search,
    newSearch => {
        const safeSearch = newSearch || '';
        if (searchQuery.value !== safeSearch) {
            searchQuery.value = safeSearch;
        }
    }
);

const userName = computed(() => authStore.user?.name || 'Guest');
const userRoleDisplay = computed(() => {
    const role = authStore.user?.role || authStore.userRole;
    return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
});

const userInitials = computed(() => {
    const name = userName.value;
    if (name === 'Guest') return 'GU';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
});

const userAvatar = computed(() => authStore.user?.avatar || null);
</script>

<template>
    <header class="h-1000 bg-neutral-50 border-b border-border-default px-600 flex items-center justify-between sticky top-0 z-20">
        <div>
            <h2 class="text-h3 text-text-primary tracking-tight">{{ pageTitle }}</h2>
            <p class="text-body-sm text-text-secondary">Welcome back to Kosanmu web app.</p>
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
                    v-model="searchQuery"
                    type="text"
                    placeholder="Search..."
                    class="w-full pl-10 pr-4 py-2 bg-neutral-100 border border-border-default rounded-default text-body-md focus:outline-none focus:border-border-focus transition-colors"
                />
            </div>

            <div class="flex items-center gap-3 pl-4 border-l border-border-default select-none">
                <div
                    class="w-10 h-10 rounded-full border border-border-default bg-action-primary text-text-inverse font-bold text-xs shadow-default flex items-center justify-center overflow-hidden shrink-0"
                >
                    <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="w-full h-full object-cover" />
                    <span v-else class="leading-none text-center">{{ userInitials }}</span>
                </div>
                <div class="hidden lg:block text-left leading-tight">
                    <p class="text-body-sm font-bold text-text-primary">{{ userName }}</p>
                    <p class="text-[11px] text-text-secondary">{{ userRoleDisplay }}</p>
                </div>
            </div>
        </div>
    </header>
</template>
