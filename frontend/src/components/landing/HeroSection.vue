<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const navigateToRooms = () => {
    router.push('/tenant/rooms');
};
</script>

<template>
    <section aria-labelledby="hero-heading" class="w-full px-6 md:px-12 py-8 md:py-1200 bg-bg-default flex flex-col gap-8 md:gap-14">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-end">
            <h1 id="hero-heading" class="text-h2 md:text-h1 text-text-primary leading-tight tracking-tight max-w-2xl">
                Comfort Starts with the<br class="hidden md:block" />
                Right Room
            </h1>

            <div class="flex flex-col items-start lg:items-end">
                <div class="flex flex-col lg:justify-end gap-5">
                    <p class="text-h5 md:text-h4 text-text-secondary max-w-md">Find a comfortable room that fits your needs and makes everyday living feel easier.</p>
                    <button
                        @click="navigateToRooms"
                        class="group flex items-center gap-3 text-h5 text-text-primary hover:text-action-primary-hover focus:outline-none rounded transition-colors cursor-pointer"
                        aria-label="Explore all available rooms"
                    >
                        <span>Explore Rooms</span>
                        <svg class="w-6 h-auto transform transition-transform group-hover:translate-x-1" viewBox="0 0 26 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path
                                d="M0 3.68164V4.18164H25V3.68164V3.18164H0V3.68164ZM25.3536 4.03519C25.5488 3.83993 25.5488 3.52335 25.3536 3.32809L22.1716 0.146107C21.9763 -0.0491555 21.6597 -0.0491555 21.4645 0.146107C21.2692 0.341369 21.2692 0.657951 21.4645 0.853214L24.2929 3.68164L21.4645 6.51007C21.2692 6.70533 21.2692 7.02191 21.4645 7.21717C21.6597 7.41244 21.9763 7.41244 22.1716 7.21717L25.3536 4.03519Z"
                                fill="currentColor"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <div class="w-full h-75 md:h-[400px] lg:h-125 relative overflow-hidden rounded-xl">
            <img
                src="@/assets/images/landing/hero-building.webp"
                alt="Kosanmu modern building facade under a clear blue sky"
                class="absolute inset-0 w-full h-full object-cover object-top"
                loading="eager"
                fetchpriority="high"
            />
        </div>
    </section>
</template>
