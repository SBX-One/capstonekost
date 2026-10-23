<script setup>
import { ref, watch, computed, onBeforeUnmount } from 'vue';
import BaseButton from '@/components/common/BaseButton.vue';
import { getImageUrl } from '@/utils/imageUtils';
import { useImageCompressor } from '@/composables/useImageCompressor';

const modelValue = defineModel({
    type: Array,
    required: true,
    default: () => [null, null, null, null],
});

const props = defineProps({
    error: {
        type: String,
        default: '',
    },
    existingImages: {
        type: Array,
        default: () => [],
    },
});

const emit = defineEmits(['remove-existing']);

const imagePreviews = ref([null, null, null, null]);
const localExisting = ref([null, null, null, null]);
const localError = ref('');

const fileInput = ref(null);
const activePreviewIndex = ref(0);

const { isCompressing, compressError, compressToWebP } = useImageCompressor();

watch(
    () => props.existingImages,
    newImages => {
        if (newImages && newImages.length > 0) {
            const mapped = [null, null, null, null];
            newImages.forEach(img => {
                if (img && img.sort_order && img.sort_order <= 4) {
                    mapped[img.sort_order - 1] = img;
                }
            });
            localExisting.value = mapped;
        }
    },
    { immediate: true, deep: true }
);

const displayPreviews = computed(() => {
    return Array(4)
        .fill(null)
        .map((_, i) => {
            if (imagePreviews.value[i]) return imagePreviews.value[i];
            if (localExisting.value[i] && localExisting.value[i].path) {
                return getImageUrl(localExisting.value[i].path);
            }
            return null;
        });
});

const triggerFileInput = (index = 0) => {
    if (isCompressing.value) return;
    localError.value = '';
    activePreviewIndex.value = index;
    if (fileInput.value) fileInput.value.click();
};

const handleThumbnailClick = index => {
    if (isCompressing.value) return;
    localError.value = '';
    activePreviewIndex.value = index;

    if (!displayPreviews.value[index]) {
        triggerFileInput(index);
    }
};

const processFile = async (file, index) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        localError.value = 'File is too large. Maximum input size is 5MB.';
        if (fileInput.value) fileInput.value.value = '';
        return;
    }

    localError.value = '';

    const finalFile = await compressToWebP(file, 2);

    if (!finalFile) {
        localError.value = compressError.value;
        if (fileInput.value) fileInput.value.value = '';
        return;
    }

    let targetIndex = index;

    if (localExisting.value[targetIndex]) {
        emit('remove-existing', localExisting.value[targetIndex].id);
        localExisting.value[targetIndex] = null;
    }

    if (imagePreviews.value[targetIndex]) {
        URL.revokeObjectURL(imagePreviews.value[targetIndex]);
    }

    const newImages = [...modelValue.value];
    newImages[targetIndex] = finalFile;
    modelValue.value = newImages;

    imagePreviews.value[targetIndex] = URL.createObjectURL(finalFile);
    if (fileInput.value) fileInput.value.value = '';
};

const removeImage = index => {
    if (isCompressing.value) return;
    localError.value = '';

    if (imagePreviews.value[index]) {
        URL.revokeObjectURL(imagePreviews.value[index]);
        const newImages = [...modelValue.value];
        newImages[index] = null;
        modelValue.value = newImages;
        imagePreviews.value[index] = null;
    } else if (localExisting.value[index]) {
        emit('remove-existing', localExisting.value[index].id);
        localExisting.value[index] = null;
    }
    if (fileInput.value) fileInput.value.value = '';
};

const handleFileDrop = (e, index) => {
    if (isCompressing.value) return;
    localError.value = '';
    const file = e.dataTransfer?.files[0];

    if (file && file.type.startsWith('image/')) {
        processFile(file, index);
    } else {
        localError.value = 'Invalid file type. Only image files are allowed.';
    }
};

const handleFileSelect = e => {
    const file = e.target.files[0];
    if (file) processFile(file, activePreviewIndex.value);
};

onBeforeUnmount(() => {
    imagePreviews.value.forEach(url => {
        if (url) URL.revokeObjectURL(url);
    });
});
</script>

<template>
    <div class="flex flex-col relative gap-4 w-full">
        <div
            v-if="isCompressing"
            class="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center rounded-default border-2 border-transparent transition-opacity duration-300"
        >
            <svg class="animate-spin h-8 w-8 text-action-primary mb-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-body-sm font-medium text-text-primary">Optimizing Image...</span>
        </div>

        <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileSelect" />

        <div
            class="w-full aspect-4/3 lg:aspect-16/10 bg-surface-default border-2 rounded-default flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ease-in-out cursor-pointer group"
            :class="
                localError || error
                    ? 'border-solid border-status-error'
                    : displayPreviews[activePreviewIndex]
                      ? 'border-solid border-transparent'
                      : 'border-dashed border-border-default hover:border-neutral-400'
            "
            @dragover.prevent
            @dragenter.prevent
            @drop.prevent="handleFileDrop($event, activePreviewIndex)"
            @click="!displayPreviews[activePreviewIndex] && triggerFileInput(activePreviewIndex)"
        >
            <template v-if="displayPreviews[activePreviewIndex]">
                <img :src="displayPreviews[activePreviewIndex]" class="w-full h-full object-cover object-center absolute inset-0 z-0 transition-opacity duration-300" />

                <button
                    type="button"
                    @click.stop="removeImage(activePreviewIndex)"
                    class="absolute top-4 right-4 z-20 bg-neutral-900/60 hover:bg-status-error text-neutral-50 p-2 rounded-full backdrop-blur-sm transition-colors"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div class="absolute inset-0 bg-black/40 z-10 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <BaseButton variant="secondary" class="bg-white border-none" @click.stop="triggerFileInput(activePreviewIndex)"> Change Image </BaseButton>
                </div>
            </template>
            <template v-else>
                <div class="flex flex-col items-center justify-center transition-transform duration-300 ease-in-out group-hover:scale-[1.02]">
                    <svg
                        class="w-14 h-14 md:w-16 md:h-16 text-neutral-500 mb-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <p class="text-h4 text-text-primary mb-1 font-semibold text-center px-4">Slot {{ activePreviewIndex + 1 }} {{ activePreviewIndex === 0 ? '(Primary)' : '' }}</p>
                    <p class="text-body-sm text-text-secondary mb-5 text-center px-4">Click or drag an image here (Max 5MB)</p>
                    <BaseButton variant="secondary" @click.stop="triggerFileInput(activePreviewIndex)">Browse a file</BaseButton>
                </div>
            </template>
        </div>

        <p v-if="localError || error" class="text-body-sm text-status-error px-1">
            {{ localError || error }}
        </p>

        <div class="grid grid-cols-4 gap-3 sm:gap-4 w-full">
            <div
                v-for="i in 4"
                :key="i - 1"
                class="w-full aspect-square bg-surface-default border-2 rounded-default flex items-center justify-center transition-all duration-300 ease-in-out cursor-pointer relative overflow-hidden group"
                :class="[
                    activePreviewIndex === i - 1
                        ? 'border-solid border-neutral-900 z-10'
                        : displayPreviews[i - 1]
                          ? 'border-solid border-transparent'
                          : 'border-dashed border-border-default hover:border-neutral-400',
                ]"
                @dragover.prevent
                @dragenter.prevent
                @drop.prevent="handleFileDrop($event, i - 1)"
                @click="handleThumbnailClick(i - 1)"
            >
                <template v-if="displayPreviews[i - 1]">
                    <img :src="displayPreviews[i - 1]" class="w-full h-full object-cover object-center absolute inset-0 z-0" />
                    <div class="absolute inset-0 transition-colors duration-300" :class="activePreviewIndex === i - 1 ? 'bg-transparent' : 'bg-black/20 hover:bg-black/10'"></div>
                </template>
                <template v-else>
                    <div class="flex flex-col items-center justify-center w-full h-full gap-1.5 p-2 transition-transform duration-300 group-hover:scale-110">
                        <svg class="w-6 h-6 md:w-7 md:h-7 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        <span v-if="i === 1" class="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider">Main</span>
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>
