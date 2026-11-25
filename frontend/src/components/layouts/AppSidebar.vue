<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminSidebarItem from '@/components/layouts/AdminSidebarItem.vue';
import { useAuthStore } from '@/stores/authStore';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isCollapsed = ref(false);

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

const menuItems = computed(() => {
    const activeRole = authStore.userRole || (route.path.startsWith('/admin') ? 'admin' : 'tenant');

    if (activeRole === 'admin') {
        return [
            { label: 'Dashboard', routeName: 'admin-dashboard', iconName: 'dashboard' },
            { label: 'Room', routeName: 'admin-rooms', iconName: 'room' },
            { label: 'Booking', routeName: 'admin-bookings', iconName: 'booking' },
            { label: 'Payment', routeName: 'admin-payments', iconName: 'payment' },
            { label: 'Issues Report', routeName: 'admin-complaints', iconName: 'issues' },
        ];
    }

    return [
        { label: 'Dashboard', routeName: 'tenant-dashboard', iconName: 'dashboard' },
        { label: 'Search Rooms', routeName: 'public-rooms', iconName: 'room' },
        { label: 'Booking', routeName: 'tenant-bookings', iconName: 'booking' },
        { label: 'Payment', routeName: 'tenant-payments', iconName: 'payment' },
        { label: 'Issues Report', routeName: 'tenant-complaints', iconName: 'issues' },
    ];
});

const generalItems = [
    { label: 'Profile', routeName: '', iconName: 'profile' },
    { label: 'Log Out', onClick: authStore.logout, iconName: 'logout' },
];

const isItemActive = item => {
    if (!item.routeName) return false;
    if (route.name === item.routeName) return true;
    if (!router.hasRoute(item.routeName)) return false;

    const resolved = router.resolve({ name: item.routeName });
    return resolved.path !== '/' && route.path.startsWith(`${resolved.path}/`);
};
</script>

<template>
    <aside
        aria-label="Sidebar navigation"
        class="bg-neutral-100 border-r border-border-default flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out select-none z-30"
        :class="isCollapsed ? 'w-20' : 'w-64'"
    >
        <div class="h-1000 flex items-center shrink-0 mb-300 border-b border-border-default transition-all duration-300" :class="isCollapsed ? 'justify-center px-0' : 'justify-between px-500'">
            <div v-if="!isCollapsed" class="flex items-center gap-3 overflow-hidden">
                <img src="@/assets/images/branding/logo-kosanmu-dark.svg" alt="Kosanmu Logo" class="h-500 w-auto shrink-0" />
            </div>

            <button
                type="button"
                @click="toggleCollapse"
                class="p-2 rounded-xl text-neutral-800 hover:bg-neutral-200 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
                :aria-label="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
                :aria-expanded="!isCollapsed"
            >
                <svg class="w-6 h-6" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2.5" />
                    <path d="M9 3v18" />
                    <path d="m15 9-3 3 3 3" class="transition-transform duration-300 origin-[13.5px_12px]" :class="{ 'rotate-180': isCollapsed }" />
                </svg>
            </button>
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto overflow-x-hidden transition-all duration-300" :class="isCollapsed ? 'px-2' : 'pr-4'">
            <div>
                <p v-if="!isCollapsed" class="px-600 mb-100 text-xs font-semibold text-text-disabled tracking-wider uppercase">MENU</p>
                <nav aria-label="Main menu" class="space-y-1">
                    <AdminSidebarItem
                        v-for="item in menuItems"
                        :key="item.routeName"
                        :label="item.label"
                        :to="item.routeName ? { name: item.routeName } : undefined"
                        :icon-name="item.iconName"
                        :is-active="isItemActive(item)"
                        :is-collapsed="isCollapsed"
                    />
                </nav>
            </div>

            <div>
                <p v-if="!isCollapsed" class="px-600 mb-100 text-xs font-semibold text-text-disabled tracking-wider uppercase">GENERAL</p>
                <nav aria-label="General menu" class="space-y-1">
                    <AdminSidebarItem
                        v-for="item in generalItems"
                        :key="item.label"
                        :label="item.label"
                        :to="item.routeName ? { name: item.routeName } : undefined"
                        :icon-name="item.iconName"
                        :is-active="isItemActive(item)"
                        :is-collapsed="isCollapsed"
                        @click="item.onClick?.()"
                    />
                </nav>
            </div>
        </div>
    </aside>
</template>
