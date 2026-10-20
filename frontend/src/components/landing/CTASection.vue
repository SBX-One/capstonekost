<script setup>
import { useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();

const navigateToKatalog = () => {
    router.push('/tenant/rooms');
};
</script>

<template>
    <section aria-labelledby="cta-heading" class="w-full px-6 md:px-12 pb-8 md:pb-1200 bg-bg-default flex flex-col gap-8 md:gap-14">
        <span class="px-4 py-2 w-fit border border-border-default rounded-xl text-body-md text-text-secondary bg-transparent select-none"> Join KOSANMU </span>
        <div class="flex flex-col gap-8 md:gap-14">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-end w-full">
                <h2 id="cta-heading" class="text-h3 md:text-h2 text-text-primary tracking-tight">
                    Ready to make KOSANMU your <br class="hidden md:block" />
                    next home?
                </h2>
                <div class="flex flex-col items-start lg:items-end">
                    <p class="text-body-md md:text-body-lg max-w-sm text-text-secondary text-left lg:text-right">Join KOSANMU and discover a comfortable space that feels right for you.</p>
                </div>
            </div>

            <figure class="relative w-full h-90 md:h-120 lg:h-150 rounded-xl overflow-hidden group">
                <img
                    src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80"
                    alt="Cozy KOSANMU bedroom interior"
                    loading="lazy"
                    class="absolute inset-0 w-full h-full object-cover transition-transform duration-1500 ease-out group-hover:scale-105"
                />
                <div class="absolute inset-0 bg-black/15 transition-colors duration-500 group-hover:bg-black/25 pointer-events-none"></div>
                <div class="absolute inset-0 flex items-center justify-center z-10">
                    <BaseButton variant="primary" size="lg" class="shadow-xl hover:scale-105 hover:shadow-2xl transition-all! duration-300!" @click="navigateToKatalog"> Get Started </BaseButton>
                </div>
            </figure>
        </div>
    </section>
</template>
