<script setup>
const highlightImages = [
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=150&h=150',
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=150&h=150',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=150&h=150',
];
</script>

<template>
    <section aria-labelledby="browse-hero-title" class="w-full">
        <div class="relative w-full h-90 md:h-120.75 rounded-xl overflow-hidden flex flex-col justify-center px-6 md:px-8">
            <img src="@/assets/images/landing/hero-building.webp" alt="" class="absolute inset-0 w-full h-full object-cover object-center" loading="eager" aria-hidden="true" />
            <div class="relative z-10 flex flex-col gap-3 max-w-2xl">
                <h1 id="browse-hero-title" class="text-h1 text-text-inverse tracking-tight">
                    Your Everyday

                    <span class="inline-flex items-center -space-x-2 align-middle mx-2" aria-hidden="true">
                        <img v-for="(img, index) in highlightImages" :key="index" :src="img" alt="" class="w-10 h-10 rounded-full border-2 border-neutral-50 object-cover" />
                    </span>

                    <br class="hidden sm:block" />
                    Space Starts Here
                </h1>

                <p class="text-h5 text-neutral-50 max-w-sm">Find a room that supports your daily routine with comfort and simplicity.</p>
            </div>
        </div>
    </section>
</template>
