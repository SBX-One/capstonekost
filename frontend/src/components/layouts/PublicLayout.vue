<script setup>
import { computed } from 'vue';
import { useRoute, RouterView } from 'vue-router';
import AppHeaderPublic from '@/components/layouts/AppHeaderPublic.vue';
import AppFooter from '@/components/layouts/AppFooter.vue';

const route = useRoute();
const isSearchVisible = computed(() => {
    return route.meta.showSearchInNavbar ?? false;
});
</script>

<template>
    <div class="min-h-screen flex flex-col bg-bg-default font-sans">
        <AppHeaderPublic :with-search="isSearchVisible" />
        <main class="grow flex flex-col w-full">
            <RouterView />
        </main>
        <AppFooter />
    </div>
</template>
