<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import AppIcon from '@/components/common/AppIcon.vue';

const props = defineProps({
    user: {
        type: Object,
        default: () => ({ name: 'Tenant' }),
    },
});

const emit = defineEmits(['logout']);

const router = useRouter();
const isOpen = ref(false);
const activeIndex = ref(-1);

const triggerRef = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = ref({
    top: '0px',
    right: '0px',
});

const menuItems = [
    { name: 'Dashboard', route: 'tenant-dashboard', icon: 'dashboard', isDanger: false },
    { name: 'My Bookings', route: 'tenant-my-room', icon: 'calendar', isDanger: false },
    { name: 'Payment History', route: 'tenant-payments', icon: 'clipboard', isDanger: false },
    { name: 'Log Out', action: 'logout', icon: 'logout', isDanger: true },
];

const updatePosition = () => {
    if (triggerRef.value) {
        const rect = triggerRef.value.getBoundingClientRect();
        const viewportWidth = document.documentElement.clientWidth;

        dropdownStyle.value = {
            top: `${rect.bottom + 6}px`,
            right: `${viewportWidth - rect.right}px`,
        };
    }
};

const toggleDropdown = async () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        updatePosition();
        activeIndex.value = -1;
        await nextTick();
    }
};

const closeDropdown = () => {
    isOpen.value = false;
    triggerRef.value?.focus();
};

const selectOption = item => {
    if (item.action === 'logout') {
        closeDropdown();
        emit('logout');
    } else if (item.route) {
        closeDropdown();
        router.push({ name: item.route });
    }
};

const handleKeyDown = e => {
    const totalItems = menuItems.length;

    if (!isOpen.value) {
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            toggleDropdown();
        }
        return;
    }

    if (e.key === 'Escape') {
        closeDropdown();
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex.value = (activeIndex.value + 1) % totalItems;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex.value = (activeIndex.value - 1 + totalItems) % totalItems;
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex.value >= 0 && activeIndex.value < totalItems) {
            selectOption(menuItems[activeIndex.value]);
        }
    }
};

const handleClickOutside = event => {
    if (isOpen.value && triggerRef.value && !triggerRef.value.contains(event.target) && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false;
    }
};

onMounted(() => {
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="relative inline-block select-none shrink-0">
        <button
            ref="triggerRef"
            @click="toggleDropdown"
            @keydown="handleKeyDown"
            class="flex items-center gap-4 min-h-9.5 py-1.5 px-4 border rounded-full transition-colors focus-visible:outline-none cursor-pointer"
            :class="isOpen ? 'border-border-focus bg-neutral-100' : 'bg-white border-border-default hover:bg-neutral-100'"
            aria-haspopup="menu"
            :aria-expanded="isOpen"
            aria-controls="tenant-dropdown-menu"
            :aria-activedescendant="activeIndex >= 0 ? `tenant-menu-item-${activeIndex}` : undefined"
            aria-label="User profile menu"
        >
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-neutral-900 text-white flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="user?.avatar" :src="user.avatar" alt="Avatar" class="w-full h-full object-cover" />
                    <span v-else class="text-xs font-bold uppercase">{{ user?.name?.charAt(0) || 'T' }}</span>
                </div>

                <span class="text-h5 font-semibold text-text-primary max-w-25 truncate hidden md:block" :title="user?.name || 'Tenant'">
                    {{ user?.name || 'Tenant' }}
                </span>
            </div>

            <svg class="w-5 h-5 text-text-primary transition-transform duration-200" :class="{ 'rotate-180': isOpen }" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 12L10 7L5 12L3 11L10 4L17 11L15 12Z" fill="currentColor" />
            </svg>
        </button>

        <Teleport to="body">
            <transition
                enter-active-class="transition ease-out duration-150"
                enter-from-class="transform opacity-0 scale-95 translate-y-2"
                enter-to-class="transform opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-100"
                leave-from-class="transform opacity-100 scale-100 translate-y-0"
                leave-to-class="transform opacity-0 scale-95 translate-y-2"
            >
                <div
                    v-if="isOpen"
                    id="tenant-dropdown-menu"
                    ref="dropdownRef"
                    :style="dropdownStyle"
                    class="fixed min-w-53 w-max max-w-xs bg-white rounded-default border border-border-default p-3 flex flex-col gap-2 shadow-default z-9999 origin-top-right"
                    role="menu"
                    aria-orientation="vertical"
                >
                    <template v-for="(item, index) in menuItems" :key="item.name">
                        <div v-if="item.isDanger" class="h-px bg-border-default my-1 w-full" role="separator"></div>
                        <button
                            :id="`tenant-menu-item-${index}`"
                            @click="selectOption(item)"
                            class="flex items-center gap-3 w-full px-3 py-2 rounded-default transition-colors focus-visible:outline-none cursor-pointer group"
                            :class="[
                                item.isDanger ? 'text-status-error hover:bg-status-error-bg' : 'text-neutral-600 hover:bg-neutral-100 hover:text-text-primary',
                                { 'bg-neutral-100 text-text-primary': !item.isDanger && activeIndex === index },
                                { 'bg-status-error-bg': item.isDanger && activeIndex === index },
                            ]"
                            role="menuitem"
                        >
                            <AppIcon
                                :name="item.icon"
                                class="w-6 h-6 transition-colors"
                                :class="[item.isDanger ? 'text-status-error' : activeIndex === index ? 'text-text-primary' : 'text-neutral-600 group-hover:text-text-primary']"
                            />
                            <span class="text-h5">{{ item.name }}</span>
                        </button>
                    </template>
                </div>
            </transition>
        </Teleport>
    </div>
</template>
