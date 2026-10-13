<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import AdminSidebarItem from '@/components/layouts/AdminSidebarItem.vue';

const route = useRoute();
const isCollapsed = ref(false);

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};

const menuItems = [
    { label: 'Dashboard', routeName: 'admin-dashboard', iconName: 'dashboard' },
    { label: 'Room', routeName: 'admin-rooms', iconName: 'room' },
    { label: 'Booking', routeName: '', iconName: 'booking' },
    { label: 'Payment', routeName: '', iconName: 'payment' },
];

const generalItems = [
    { label: 'Log Out', routeName: '', iconName: 'logout' },
    { label: 'Profile', routeName: '', iconName: 'profile' },
];
</script>

<template>
    <aside class="bg-neutral-100 border-r border-border-default flex flex-col h-screen sticky top-0 transition-all duration-300 ease-in-out select-none z-30" :class="isCollapsed ? 'w-20' : 'w-64'">
        <div class="h-1000 flex items-center shrink-0 mb-300 border-b border-border-default transition-all duration-300" :class="isCollapsed ? 'justify-center px-0' : 'justify-between px-500'">
            <div v-if="!isCollapsed" class="flex items-center gap-3 overflow-hidden">
                <img src="@/assets/images/branding/logo-kosanmu-dark.svg" alt="Kosanmu Logo" class="h-500 w-auto shrink-0" />
            </div>

            <button
                @click="toggleCollapse"
                class="p-2 rounded-xl text-neutral-800 hover:bg-neutral-200 transition-colors flex items-center justify-center shrink-0"
                :title="isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'"
            >
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="18" x="3" y="3" rx="2.5" />
                    <path d="M9 3v18" />
                    <path d="m15 9-3 3 3 3" class="transition-transform duration-300 origin-[13.5px_12px]" :class="{ 'rotate-180': isCollapsed }" />
                </svg>
            </button>
        </div>

        <div class="flex-1 space-y-6 overflow-y-auto overflow-x-hidden transition-all duration-300" :class="isCollapsed ? 'px-2' : 'pr-4'">
            <div>
                <p v-if="!isCollapsed" class="px-600 mb-100 text-xs font-semibold text-text-disabled tracking-wider uppercase">MENU</p>
                <nav class="space-y-1">
                    <AdminSidebarItem
                        v-for="item in menuItems"
                        :key="item.routeName"
                        :label="item.label"
                        :to="{ name: item.routeName }"
                        :icon-name="item.iconName"
                        :is-active="route.name === item.routeName"
                        :is-collapsed="isCollapsed"
                    />
                </nav>
            </div>

            <div>
                <p v-if="!isCollapsed" class="px-600 mb-100 text-xs font-semibold text-text-disabled tracking-wider uppercase">GENERAL</p>
                <nav class="space-y-1">
                    <AdminSidebarItem
                        v-for="item in generalItems"
                        :key="item.routeName"
                        :label="item.label"
                        :to="{ name: item.routeName }"
                        :icon-name="item.iconName"
                        :is-active="route.name === item.routeName"
                        :is-collapsed="isCollapsed"
                    />
                </nav>
            </div>
        </div>
    </aside>
</template>
