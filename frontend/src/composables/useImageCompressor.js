import { ref } from 'vue';
import imageCompression from 'browser-image-compression';

export function useImageCompressor() {
    const isCompressing = ref(false);
    const compressError = ref('');

    const compressToWebP = async (file, maxOutputMB = 2) => {
        if (!file || !file.type.startsWith('image/')) {
            compressError.value = 'Invalid file format. Please upload an image file.';
            return null;
        }

        isCompressing.value = true;
        compressError.value = '';

        try {
            const options = {
                maxSizeMB: maxOutputMB,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: 'image/webp',
                initialQuality: 0.85,
            };

            const compressedBlob = await imageCompression(file, options);

            let baseName = 'image';
            if (file.name) {
                const lastDotIndex = file.name.lastIndexOf('.');
                baseName = lastDotIndex !== -1 ? file.name.substring(0, lastDotIndex) : file.name;
            }

            const safeName = (baseName || 'image').replace(/[^a-zA-Z0-9_-]/g, "_");
            const finalFileName = `${safeName}_${Date.now()}.webp`;

            const finalFile = new File([compressedBlob], finalFileName, {
                type: 'image/webp',
                lastModified: Date.now(),
            });

            return finalFile;
        } catch (error) {
            console.error('Image compression failed:', error);
            compressError.value = 'Failed to process and optimize the image. Please try again.';
            return null;
        } finally {
            isCompressing.value = false;
        }
    };

    return {
        isCompressing,
        compressError,
        compressToWebP,
    };
}