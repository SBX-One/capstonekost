<script setup>
import AppSidebar from '@/components/layouts/AppSidebar.vue';
import AppHeader from '@/components/layouts/AppHeader.vue';
</script>

<template>
    <div class="min-h-screen bg-bg-default flex overflow-hidden">
        <AppSidebar />

        <div class="flex-1 flex flex-col h-screen overflow-hidden">
            <AppHeader />
            <main class="flex-1 p-500 overflow-y-auto bg-bg-default">
                <router-view />
            </main>
        </div>
    </div>
</template>
