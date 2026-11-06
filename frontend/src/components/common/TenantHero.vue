<script setup>
import { useRouter } from 'vue-router';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
    label: {
        type: String,
        default: 'My Booking',
    },
    title: {
        type: String,
        default: 'Your Stay, All in One Place.',
    },
    subtitle: {
        type: String,
        default: 'Easily track your bookings, check your rental status, and stay updated throughout your stay.',
    },
    buttonText: {
        type: String,
        default: 'Browse Rooms',
    },
    targetRouteName: {
        type: String,
        default: 'public-rooms',
    },
});

const router = useRouter();

const handleActionClick = () => {
    if (props.targetRouteName) {
        router.push({ name: props.targetRouteName });
    }
};
</script>

<template>
    <section
        class="relative w-full rounded-xl overflow-hidden min-h-81.25 flex items-center"
        style="background-image: url('/src/assets/images/landing/hero-building.webp'); background-position: center right; background-size: cover; background-repeat: no-repeat"
    >
        <div class="absolute inset-0 bg-[#5B9BD5]/80 md:hidden z-0"></div>

        <div class="relative z-10 p-10 flex flex-col gap-6 w-full max-w-xl">
            <header class="flex flex-col gap-1">
                <span class="text-body-sm uppercase font-semibold text-text-inverse tracking-widest">
                    <slot name="label">{{ label }}</slot>
                </span>
                <h1 class="text-h2 md:text-h1 font-bold text-text-inverse leading-tight text-balance">
                    {{ title }}
                </h1>
            </header>

            <p class="text-body-md text-text-inverse max-w-md text-pretty">
                {{ subtitle }}
            </p>

            <BaseButton variant="primary" size="sm" @click="handleActionClick">
                {{ buttonText }}
            </BaseButton>
        </div>
    </section>
</template>
