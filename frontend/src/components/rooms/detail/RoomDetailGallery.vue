<script setup>
import { ref, computed, watch } from 'vue';
import { getImageUrl } from '@/utils/imageUtils';

const props = defineProps({
    imagePaths: {
        type: Array,
        default: () => [],
    },
});

const activeIndex = ref(0);

watch(
    () => props.imagePaths,
    () => {
        activeIndex.value = 0;
    },
    { deep: true }
);

const sortedImages = computed(() => {
    if (!props.imagePaths || !Array.isArray(props.imagePaths)) return [];

    return props.imagePaths
        .filter(img => img && typeof img.path === 'string' && img.path.trim() !== '')
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(img => getImageUrl(img.path));
});

const thumbnailSlots = computed(() => {
    const imgs = sortedImages.value;
    const slots = [];
    for (let i = 0; i < 4; i++) {
        slots.push(imgs[i] || null);
    }
    return slots;
});

const nextImage = () => {
    if (sortedImages.value.length <= 1) return;
    activeIndex.value = (activeIndex.value + 1) % sortedImages.value.length;
};

const prevImage = () => {
    if (sortedImages.value.length <= 1) return;
    activeIndex.value = activeIndex.value === 0 ? sortedImages.value.length - 1 : activeIndex.value - 1;
};

const setActiveImage = index => {
    if (sortedImages.value[index]) {
        activeIndex.value = index;
    }
};

const handleImageError = event => {
    event.target.src =
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='20' font-weight='600' fill='%239ca3af' text-anchor='middle' dy='.3em'%3EImage Not Found%3C/text%3E%3C/svg%3E";
};
</script>

<template>
    <div
        v-if="sortedImages.length === 0"
        class="w-full aspect-4/3 lg:h-173 bg-neutral-100 rounded-xl flex flex-col items-center justify-center text-text-secondary border-2 border-dashed border-border-default"
        aria-live="polite"
    >
        <svg class="w-12 h-12 mb-2 text-neutral-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </svg>
        <span class="text-body-lg font-medium">No Room Images Available</span>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 w-full" aria-roledescription="carousel">
        <div
            class="relative w-full aspect-4/3 lg:aspect-auto lg:h-150 xl:h-173 rounded-lg overflow-hidden group bg-neutral-100 transition-all"
            :class="sortedImages.length === 1 ? 'lg:col-span-12' : 'lg:col-span-9'"
        >
            <img :src="sortedImages[activeIndex]" @error="handleImageError" alt="Room detail view" class="w-full h-full object-cover transition-opacity duration-300" />

            <button
                v-if="sortedImages.length > 1"
                @click="prevImage"
                aria-label="Previous image"
                class="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 w-14.5 h-14.5 bg-neutral-900/60 hover:bg-neutral-900/90 focus:outline-none text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
                <svg class="w-6 h-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M13.383 17.9553C13.6174 17.7209 13.749 17.403 13.749 17.0715C13.749 16.74 13.6174 16.4221 13.383 16.1877L7.1955 10.0002L13.383 3.81269C13.6035 3.57579 13.7236 3.26258 13.7179 2.93897C13.7122 2.61535 13.5812 2.30656 13.3525 2.07757C13.1237 1.84858 12.8151 1.71724 12.4915 1.71119C12.1679 1.70513 11.8545 1.82483 11.6174 2.04511L4.54511 9.11542C4.31075 9.34984 4.17909 9.66774 4.17909 9.99921C4.17909 10.3307 4.31075 10.6486 4.54511 10.883L11.6154 17.9553C11.8498 18.1896 12.1677 18.3213 12.4992 18.3213C12.8307 18.3213 13.1486 18.1896 13.383 17.9553Z"
                        fill="currentColor"
                    />
                </svg>
            </button>

            <button
                v-if="sortedImages.length > 1"
                @click="nextImage"
                aria-label="Next image"
                class="absolute right-4 lg:right-6 top-1/2 -translate-y-1/2 w-14.5 h-14.5 bg-neutral-900/60 hover:bg-neutral-900/90 focus:outline-none text-white rounded-full flex items-center justify-center backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
                <svg class="w-6 h-6" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6.617 2.04473C6.38264 2.27915 6.25098 2.59705 6.25098 2.92852C6.25098 3.26 6.38264 3.5779 6.617 3.81231L12.8045 9.99981L6.617 16.1873C6.39646 16.4242 6.27641 16.7374 6.28211 17.061C6.2878 17.3846 6.4188 17.6934 6.64754 17.9224C6.87628 18.1514 7.18492 18.2828 7.50853 18.2888C7.83214 18.2949 8.14548 18.1752 8.38262 17.9549L15.4549 10.8846C15.6893 10.6502 15.8209 10.3323 15.8209 10.0008C15.8209 9.66931 15.6893 9.35141 15.4549 9.117L8.38458 2.04473C8.15016 1.81037 7.83226 1.67871 7.50079 1.67871C7.16931 1.67871 6.85141 1.81037 6.617 2.04473Z"
                        fill="currentColor"
                    />
                </svg>
            </button>

            <div class="absolute bottom-4 right-4 lg:hidden bg-neutral-900/60 text-white text-xs font-medium px-3 py-1 rounded-full backdrop-blur-sm">
                {{ activeIndex + 1 }} / {{ sortedImages.length }}
            </div>
        </div>

        <div v-if="sortedImages.length > 1" class="hidden lg:flex lg:col-span-3 flex-col gap-4 lg:h-150 xl:h-173">
            <template v-for="(img, index) in thumbnailSlots" :key="index">
                <button
                    v-if="img"
                    @click="setActiveImage(index)"
                    :aria-label="`View image ${index + 1}`"
                    :aria-current="activeIndex === index ? 'true' : 'false'"
                    class="w-full flex-1 rounded-lg overflow-hidden cursor-pointer relative border-2 transition-all focus:outline-none"
                    :class="activeIndex === index ? 'border-neutral-900' : 'border-transparent hover:border-border-default'"
                >
                    <img :src="img" @error="handleImageError" alt="" role="presentation" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 transition-colors" :class="activeIndex === index ? 'bg-transparent' : 'bg-black/20 hover:bg-black/10'"></div>
                </button>

                <div v-else class="w-full flex-1 rounded-lg bg-neutral-100 border-2 border-dashed border-border-default flex items-center justify-center text-neutral-300 select-none">
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.5"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                </div>
            </template>
        </div>
    </div>
</template>
