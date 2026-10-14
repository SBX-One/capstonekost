<script setup>
import AppModal from '@/components/common/AppModal.vue';

defineProps({
    isOpen: {
        type: Boolean,
        required: true,
        default: false,
    },
    title: {
        type: String,
        default: 'Room deleted successfully!',
    },
    message: {
        type: String,
        default: 'The room has been removed from the room list',
    },
});

defineEmits(['close']);
</script>

<template>
    <AppModal :is-open="isOpen" @close="$emit('close')">
        <div class="text-center flex flex-col items-center pt-2 pb-2">
            <svg class="w-15 h-15 text-status-success" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M30 2.5C14.8125 2.5 2.5 14.8125 2.5 30C2.5 45.1875 14.8125 57.5 30 57.5C45.1875 57.5 57.5 45.1875 57.5 30C57.5 14.8125 45.1875 2.5 30 2.5ZM41.92 25.35C42.1395 25.0991 42.3066 24.8068 42.4115 24.4904C42.5163 24.174 42.5569 23.8398 42.5307 23.5075C42.5045 23.1751 42.4121 22.8514 42.2589 22.5553C42.1058 22.2592 41.895 21.9968 41.6389 21.7834C41.3828 21.5699 41.0866 21.4099 40.7677 21.3127C40.4489 21.2154 40.1138 21.1829 39.7822 21.2171C39.4506 21.2512 39.1292 21.3514 38.8369 21.5116C38.5445 21.6718 38.2872 21.8889 38.08 22.15L27.33 35.0475L21.7675 29.4825C21.296 29.0271 20.6645 28.7751 20.009 28.7808C19.3535 28.7865 18.7265 29.0494 18.263 29.513C17.7994 29.9765 17.5365 30.6035 17.5308 31.259C17.5251 31.9145 17.7771 32.546 18.2325 33.0175L25.7325 40.5175C25.9781 40.763 26.2722 40.9546 26.596 41.0802C26.9198 41.2057 27.2662 41.2624 27.6132 41.2466C27.9601 41.2309 28.2999 41.143 28.611 40.9886C28.9221 40.8342 29.1976 40.6168 29.42 40.35L41.92 25.35Z"
                    fill="currentColor"
                />
            </svg>

            <h3 class="text-h3 font-bold text-text-primary mb-2 wrap-break-word w-full">{{ title }}</h3>

            <div class="max-h-32 overflow-y-auto w-full px-2 custom-scrollbar">
                <p class="text-body-md text-text-secondary wrap-break-word">{{ message }}</p>
            </div>
        </div>
    </AppModal>
</template>
