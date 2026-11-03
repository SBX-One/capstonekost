<script setup>
import { RouterView } from 'vue-router';
import AppHeaderPublic from '@/components/layouts/AppHeaderPublic.vue';
import AppFooter from '@/components/layouts/AppFooter.vue';
</script>

<template>
    <div class="min-h-screen flex flex-col bg-bg-default font-sans">
        <AppHeaderPublic />
        <main class="grow flex flex-col w-full">
            <RouterView />
        </main>
        <AppFooter />
    </div>
</template>
