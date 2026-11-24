<script setup>
import { ref, watch } from 'vue';
import ComplaintStatusBadge from '@/components/complaints/ComplaintStatusBadge.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
    complaint: {
        type: Object,
        required: true,
    },
});

const emit = defineEmits(['view-detail']);

const imageError = ref(false);

watch(
    () => props.complaint?.thumbnailUrl,
    () => {
        imageError.value = false;
    }
);
</script>

<template>
    <article :aria-labelledby="`complaint-title-${complaint.id}`" class="bg-neutral-100 rounded-default p-4.5 flex flex-col gap-6">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-5">
            <div class="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 flex-1 min-w-0">
                <div class="w-full sm:w-56 md:w-60 aspect-16/10 rounded-default overflow-hidden shrink-0 bg-neutral-200 flex items-center justify-center">
                    <img
                        v-if="complaint.thumbnailUrl && !imageError"
                        :src="complaint.thumbnailUrl"
                        :alt="complaint.title"
                        loading="lazy"
                        @error="imageError = true"
                        class="w-full h-full object-cover"
                    />
                    <svg v-else class="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                        />
                    </svg>
                </div>

                <div class="flex flex-col gap-3 flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3 sm:block">
                        <h2 :id="`complaint-title-${complaint.id}`" class="text-h4 text-text-primary tracking-tight line-clamp-1">
                            {{ complaint.title }}
                        </h2>
                        <div class="sm:hidden shrink-0">
                            <ComplaintStatusBadge :status="complaint.status" />
                        </div>
                    </div>

                    <p class="text-body-md text-text-secondary line-clamp-2">
                        {{ complaint.description }}
                    </p>

                    <div class="flex items-center gap-1.5 text-body-md text-text-primary">
                        <svg class="w-4 h-4 shrink-0 text-text-primary" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <path
                                d="M10.6666 6.66667C10.6666 5.19333 9.47331 4 7.99998 4C6.52665 4 5.33331 5.19333 5.33331 6.66667C5.33331 8.14 6.52665 9.33333 7.99998 9.33333C9.47331 9.33333 10.6666 8.14 10.6666 6.66667ZM6.66665 6.66667C6.66665 5.93333 7.26665 5.33333 7.99998 5.33333C8.73331 5.33333 9.33331 5.93333 9.33331 6.66667C9.33331 7.4 8.73331 8 7.99998 8C7.26665 8 6.66665 7.4 6.66665 6.66667Z"
                                fill="currentColor"
                            />
                            <path
                                d="M7.61336 14.5415C7.72669 14.6215 7.86669 14.6681 8.00002 14.6681C8.13336 14.6681 8.27336 14.6281 8.38669 14.5415C8.58669 14.3948 13.3534 10.9615 13.3334 6.66146C13.3334 3.72146 10.94 1.32812 8.00002 1.32812C5.06002 1.32812 2.66669 3.72146 2.66669 6.66146C2.64669 10.9548 7.41336 14.3948 7.61336 14.5415ZM8.00002 2.66813C10.2067 2.66813 12 4.46146 12 6.66813C12.0134 9.62813 9.07336 12.2881 8.00002 13.1615C6.92669 12.2881 3.98669 9.63479 4.00002 6.66813C4.00002 4.46146 5.79336 2.66813 8.00002 2.66813Z"
                                fill="currentColor"
                            />
                        </svg>
                        <span class="truncate">{{ complaint.location }}</span>
                    </div>
                </div>
            </div>

            <div class="hidden sm:block shrink-0">
                <ComplaintStatusBadge :status="complaint.status" />
            </div>
        </div>

        <div class="pt-6 border-t border-border-default flex flex-wrap items-center justify-between gap-4">
            <p class="text-h5 text-text-primary">Reported on {{ complaint.createdAtLabel }}.</p>
            <BaseButton variant="secondary" size="sm" @click="emit('view-detail', complaint.id)"> View Detail </BaseButton>
        </div>
    </article>
</template>
