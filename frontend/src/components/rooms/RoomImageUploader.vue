<script setup>
import { ref, onBeforeUnmount } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';

const modelValue = defineModel({
    type: Array,
    required: true,
    default: () => [null, null, null, null, null],
});

const props = defineProps({
    error: {
        type: String,
        default: '',
    },
});

const imagePreviews = ref([null, null, null, null, null]);
const fileInput = ref(null);
const activeImageIndex = ref(0);

const triggerFileInput = (index = 0) => {
    activeImageIndex.value = index;
    if (fileInput.value) fileInput.value.click();
};

const processFile = (file, index) => {
    if (!file) return;

    let targetIndex = index;
    if (index !== 0 && !modelValue.value[0]) {
        targetIndex = 0;
    }

    if (imagePreviews.value[targetIndex]) {
        URL.revokeObjectURL(imagePreviews.value[targetIndex]);
    }

    const newImages = [...modelValue.value];
    newImages[targetIndex] = file;
    modelValue.value = newImages;

    imagePreviews.value[targetIndex] = URL.createObjectURL(file);

    if (fileInput.value) fileInput.value.value = '';
};

const removeImage = index => {
    if (imagePreviews.value[index]) {
        URL.revokeObjectURL(imagePreviews.value[index]);
    }

    const newImages = [...modelValue.value];
    newImages[index] = null;
    modelValue.value = newImages;
    imagePreviews.value[index] = null;

    if (fileInput.value) fileInput.value.value = '';
};

const handleFileDrop = (e, index = 0) => {
    const file = e.dataTransfer?.files[0];
    if (file) processFile(file, index);
};

const handleFileSelect = e => {
    const file = e.target.files[0];
    if (file) processFile(file, activeImageIndex.value);
};

onBeforeUnmount(() => {
    imagePreviews.value.forEach(url => {
        if (url) URL.revokeObjectURL(url);
    });
});
</script>

<template>
    <div class="flex flex-col">
        <input type="file" ref="fileInput" class="hidden" accept="image/avif" @change="handleFileSelect" />

        <div
            class="w-full h-105 bg-neutral-100 border-2 border-dashed rounded-default flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-200 cursor-pointer"
            :class="error ? 'border-status-error' : 'border-border-default hover:border-border-focus'"
            @dragover.prevent
            @dragenter.prevent
            @drop.prevent="handleFileDrop($event, 0)"
            @click="!imagePreviews[0] && triggerFileInput(0)"
        >
            <template v-if="imagePreviews[0]">
                <img :src="imagePreviews[0]" class="w-full h-full object-cover absolute inset-0 z-0" />

                <button
                    type="button"
                    @click.stop="removeImage(0)"
                    class="absolute top-4 right-4 z-20 bg-neutral-900/60 hover:bg-status-error text-neutral-50 p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                <div class="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <BaseButton variant="secondary" class="bg-white border-none" @click.stop="triggerFileInput(0)"> Change Main Image </BaseButton>
                </div>
            </template>
            <template v-else>
                <svg class="w-12 h-12 text-text-secondary mb-500" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M23.9999 28L22.5859 29.414L23.9999 30.828L25.4139 29.414L23.9999 28ZM25.9999 10C25.9999 9.46957 25.7892 8.96086 25.4142 8.58579C25.0391 8.21071 24.5304 8 23.9999 8C23.4695 8 22.9608 8.21071 22.5857 8.58579C22.2107 8.96086 21.9999 9.46957 21.9999 10H25.9999ZM12.5859 19.414L22.5859 29.414L25.4139 26.586L15.4139 16.586L12.5859 19.414ZM25.4139 29.414L35.4139 19.414L32.5859 16.586L22.5859 26.586L25.4139 29.414ZM25.9999 28V10H21.9999V28H25.9999Z"
                        fill="currentColor"
                    />
                    <path
                        d="M10 32V34C10 35.0609 10.4214 36.0783 11.1716 36.8284C11.9217 37.5786 12.9391 38 14 38H34C35.0609 38 36.0783 37.5786 36.8284 36.8284C37.5786 36.0783 38 35.0609 38 34V32"
                        stroke-width="4"
                        stroke="currentColor"
                    />
                </svg>
                <p class="text-h4 text-text-primary mb-200 font-semibold">Choose a file and drag & drop it here.</p>
                <p class="text-body-sm text-text-secondary mb-600">.AVIF up to 5 MB</p>
                <BaseButton variant="secondary" @click.stop="triggerFileInput(0)">Browse a file</BaseButton>
            </template>
        </div>

        <p v-if="error" class="text-body-sm text-status-error mt-200">{{ error }}</p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-200 mt-300">
            <div
                v-for="i in 4"
                :key="i"
                class="aspect-square bg-neutral-100 border-2 border-dashed rounded-default flex items-center justify-center text-text-secondary hover:bg-neutral-200 transition-colors cursor-pointer relative overflow-hidden"
                :class="imagePreviews[i] ? 'border-transparent' : 'border-border-default'"
                @dragover.prevent
                @dragenter.prevent
                @drop.prevent="handleFileDrop($event, i)"
                @click="!imagePreviews[i] && triggerFileInput(i)"
            >
                <template v-if="imagePreviews[i]">
                    <img :src="imagePreviews[i]" class="w-full h-full object-cover absolute inset-0 z-0" />

                    <button
                        type="button"
                        @click.stop="removeImage(i)"
                        class="absolute top-2 right-2 z-20 bg-neutral-900/60 hover:bg-status-error text-neutral-50 p-1.5 rounded-full backdrop-blur-sm transition-colors"
                    >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div class="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity" @click.stop="triggerFileInput(i)">
                        <svg class="w-6 h-6 text-neutral-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                        </svg>
                    </div>
                </template>
                <template v-else>
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 4v16m8-8H4"></path></svg>
                </template>
            </div>
        </div>
    </div>
</template>
