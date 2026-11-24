<script setup>
import { ref, computed } from 'vue';
import AppDrawer from '@/components/common/AppDrawer.vue';
import AppModal from '@/components/common/AppModal.vue';
import BaseButton from '@/components/common/BaseButton.vue';
import ComplaintStatusAlert from '@/components/complaints/ComplaintStatusAlert.vue';
import ComplaintProgressTimeline from '@/components/complaints/ComplaintProgressTimeline.vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        default: 'tenant',
        validator: val => ['admin', 'tenant'].includes(val),
    },
    issue: {
        type: Object,
        default: null,
    },
    isLoading: {
        type: Boolean,
        default: false,
    },
    isSubmitting: {
        type: Boolean,
        default: false,
    },
    error: {
        type: String,
        default: '',
    },
});

const emit = defineEmits(['close', 'retry', 'start-handling', 'mark-resolved', 'contact-tenant']);

const previewImageUrl = ref('');

const isAdmin = computed(() => props.role === 'admin');

const normalizedStatus = computed(() => {
    const raw = String(props.issue?.status || 'open')
        .toLowerCase()
        .trim();
    if (['progress', 'in_progress', 'in progress'].includes(raw)) return 'in_progress';
    if (raw === 'resolved') return 'resolved';
    return 'open';
});

const tenantInfo = computed(() => {
    const tenant = props.issue?.tenant || props.issue?.user || {};
    return {
        name: props.issue?.tenantName || tenant.name || '-',
        email: props.issue?.tenantEmail || tenant.email || '-',
        phone: props.issue?.tenantPhone || tenant.phone || tenant.phone_number || '-',
    };
});

function extractImageUrls(source) {
    if (!Array.isArray(source)) return [];
    return source.map(item => (typeof item === 'string' ? item : item?.url || item?.image_url || item?.path || '')).filter(Boolean);
}

const attachedPhotos = computed(() => {
    const rawPhotos = props.issue?.images || props.issue?.photos || props.issue?.attachments || [];
    return extractImageUrls(rawPhotos);
});

const adminResponse = computed(() => {
    const resp = props.issue?.adminResponse || props.issue?.admin_response || props.issue?.response;
    if (!resp) return null;

    if (typeof resp === 'string') {
        const cleaned = resp.trim();
        return cleaned && cleaned !== '-' ? { description: cleaned, images: [] } : null;
    }

    const rawDesc = String(resp.description || resp.response || resp.message || resp.text || '').trim();
    const description = rawDesc && rawDesc !== '-' ? rawDesc : '';
    const images = extractImageUrls(resp.images || (resp.imageUrl ? [resp.imageUrl] : []));

    if (!description && images.length === 0) return null;
    return { description, images };
});

const showAdminResponse = computed(() => {
    return normalizedStatus.value !== 'open' && Boolean(adminResponse.value);
});

const showFooter = computed(() => {
    return isAdmin.value && Boolean(props.issue) && !props.isLoading && normalizedStatus.value !== 'resolved';
});

function openImagePreview(url) {
    if (!url) return;
    previewImageUrl.value = url;
}

function closeImagePreview() {
    previewImageUrl.value = '';
}
</script>

<template>
    <AppDrawer
        :is-open="isOpen"
        title="Report Issues Detail"
        max-width="md:max-w-xl"
        :persistent="isSubmitting"
        header-class="px-6 sm:px-10 pt-8 sm:pt-10 pb-6 sm:pb-8"
        body-class="px-6 sm:px-10 pt-4 sm:pt-6 pb-8 sm:pb-10 flex flex-col gap-8 sm:gap-10"
        @close="emit('close')"
    >
        <div v-if="isLoading" class="flex flex-col gap-8 sm:gap-10 animate-pulse" aria-busy="true" aria-label="Loading issue details">
            <div class="h-8 w-3/4 bg-neutral-200 rounded-md"></div>
            <div class="h-22 w-full bg-neutral-200 rounded-default"></div>

            <div class="flex flex-col gap-4">
                <div class="h-5 w-36 bg-neutral-200 rounded-md"></div>
                <div class="bg-neutral-100 rounded-default px-3 py-4 flex flex-col gap-4">
                    <div class="flex justify-between">
                        <div class="h-5 w-28 bg-neutral-200 rounded-md"></div>
                        <div class="h-5 w-24 bg-neutral-200 rounded-md"></div>
                    </div>
                    <div class="flex justify-between">
                        <div class="h-5 w-28 bg-neutral-200 rounded-md"></div>
                        <div class="h-5 w-32 bg-neutral-200 rounded-md"></div>
                    </div>
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <div class="h-5 w-40 bg-neutral-200 rounded-md"></div>
                <div class="bg-neutral-100 rounded-default px-3 py-4 flex flex-col gap-2">
                    <div class="h-5 w-full bg-neutral-200 rounded-md"></div>
                    <div class="h-5 w-4/5 bg-neutral-200 rounded-md"></div>
                </div>
            </div>

            <div class="flex flex-col gap-4">
                <div class="h-5 w-32 bg-neutral-200 rounded-md"></div>
                <div class="bg-neutral-100 rounded-default p-3 flex flex-col gap-4">
                    <div v-for="step in 3" :key="step" class="flex items-start gap-3">
                        <div class="w-6 h-6 rounded-full bg-neutral-200 shrink-0"></div>
                        <div class="flex flex-col gap-2 flex-1">
                            <div class="h-5 w-36 bg-neutral-200 rounded-md"></div>
                            <div class="h-4 w-full bg-neutral-200 rounded-md"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else-if="error && !issue" role="alert" class="p-4 rounded-default bg-status-error-bg border border-status-error text-status-error flex flex-col items-start gap-3">
            <p class="text-body-md">{{ error }}</p>
            <BaseButton variant="secondary" size="sm" @click="emit('retry')">Retry</BaseButton>
        </div>

        <template v-else-if="issue">
            <h3 class="text-h3 text-text-primary">{{ issue.title }}</h3>

            <ComplaintStatusAlert :status="normalizedStatus" :role="role" />

            <section v-if="isAdmin" class="flex flex-col gap-4 w-full shrink-0">
                <h4 class="text-h5 font-semibold text-text-secondary">Tenant Information</h4>
                <div class="w-full bg-neutral-100 rounded-default px-3 py-4 flex flex-col gap-4 text-left">
                    <div class="flex justify-between items-center gap-4 text-body-md">
                        <span class="text-text-secondary shrink-0">Name</span>
                        <span class="text-text-primary text-right truncate">{{ tenantInfo.name }}</span>
                    </div>
                    <div class="flex justify-between items-center gap-4 text-body-md">
                        <span class="text-text-secondary shrink-0">Email Address</span>
                        <span class="text-text-primary text-right break-all">{{ tenantInfo.email }}</span>
                    </div>
                    <div class="flex justify-between items-center gap-4 text-body-md">
                        <span class="text-text-secondary shrink-0">Phone Number</span>
                        <span class="text-text-primary text-right">{{ tenantInfo.phone }}</span>
                    </div>
                </div>
            </section>

            <section class="flex flex-col gap-4 w-full shrink-0">
                <h4 class="text-h5 font-semibold text-text-secondary">Issues Information</h4>
                <div class="w-full bg-neutral-100 rounded-default px-3 py-4 flex flex-col gap-4 text-left">
                    <div class="flex justify-between items-center gap-4 text-body-md">
                        <span class="text-text-secondary shrink-0">Issues Location</span>
                        <span class="text-text-primary text-right">{{ issue.location || '-' }}</span>
                    </div>
                    <div class="flex justify-between items-center gap-4 text-body-md">
                        <span class="text-text-secondary shrink-0">Reported date</span>
                        <span class="text-text-primary text-right">{{ issue.createdAtLabel || '-' }}</span>
                    </div>
                </div>
            </section>

            <section class="flex flex-col gap-4 w-full shrink-0">
                <h4 class="text-h5 font-semibold text-text-secondary">Issues Description</h4>
                <div class="w-full bg-neutral-100 rounded-default px-3 py-4 text-left">
                    <p class="text-body-md text-text-primary whitespace-pre-line">{{ issue.description || '-' }}</p>
                </div>
            </section>

            <section v-if="attachedPhotos.length > 0" class="flex flex-col gap-4 w-full shrink-0">
                <h4 class="text-h5 font-semibold text-text-secondary">Attached Photos</h4>
                <div class="w-full bg-neutral-100 rounded-default px-3 py-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                        v-for="(photoUrl, idx) in attachedPhotos"
                        :key="`attached-photo-${idx}`"
                        type="button"
                        @click="openImagePreview(photoUrl)"
                        :aria-label="`Preview attached photo ${idx + 1}`"
                        class="group relative w-full aspect-16/10 rounded-default overflow-hidden bg-neutral-200 focus-visible:outline-none cursor-pointer"
                    >
                        <img :src="photoUrl" :alt="`${issue.title} attachment ${idx + 1}`" loading="lazy" class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
                    </button>
                </div>
            </section>

            <ComplaintProgressTimeline :status="normalizedStatus" :role="role" :created-at-label="issue.createdAtLabel" :raw="issue.raw" :timeline="issue.timeline" />

            <section v-if="showAdminResponse" class="flex flex-col gap-4 w-full shrink-0">
                <h4 class="text-h5 font-semibold text-text-secondary">Admin Response</h4>
                <div class="w-full bg-neutral-100 rounded-default px-3 py-4 flex flex-col gap-4 text-left">
                    <p v-if="adminResponse.description" class="text-body-md text-text-primary whitespace-pre-line">
                        {{ adminResponse.description }}
                    </p>

                    <div v-if="adminResponse.images.length > 0" class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <button
                            v-for="(respImgUrl, idx) in adminResponse.images"
                            :key="`admin-response-photo-${idx}`"
                            type="button"
                            @click="openImagePreview(respImgUrl)"
                            :aria-label="`Preview admin response photo ${idx + 1}`"
                            class="group relative w-full aspect-16/10 rounded-default overflow-hidden bg-neutral-200 focus-visible:outline-none cursor-pointer"
                        >
                            <img
                                :src="respImgUrl"
                                :alt="`Admin response evidence ${idx + 1}`"
                                loading="lazy"
                                class="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                        </button>
                    </div>
                </div>
            </section>
        </template>

        <template v-if="showFooter" #footer>
            <BaseButton v-if="normalizedStatus === 'open'" variant="primary" block size="md" :disabled="isSubmitting" @click="emit('start-handling', issue.id)"> Start Handling </BaseButton>

            <BaseButton v-else-if="normalizedStatus === 'in_progress'" variant="success" block size="md" :disabled="isSubmitting" @click="emit('mark-resolved', issue.id)">
                Mark as Resolved
            </BaseButton>

            <BaseButton variant="secondary" block size="md" :disabled="isSubmitting" @click="emit('contact-tenant', issue)"> Contact Tenant </BaseButton>
        </template>
    </AppDrawer>

    <AppModal :is-open="Boolean(previewImageUrl)" max-width="max-w-3xl" @close="closeImagePreview">
        <div class="p-4 sm:p-6 bg-bg-default flex items-center justify-center">
            <img v-if="previewImageUrl" :src="previewImageUrl" alt="Full size attachment preview" class="max-h-[80vh] w-auto object-contain rounded-default" />
        </div>
    </AppModal>
</template>
