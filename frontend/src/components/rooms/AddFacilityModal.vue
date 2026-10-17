<script setup>
import { ref } from 'vue';
import { sanitizeText } from '@/utils/sanitizers';

import AppModal from '@/components/common/AppModal.vue';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
    isOpen: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close', 'add-facility']);

const facilityName = ref('');

const handleClose = () => {
    facilityName.value = '';
    emit('close');
};

const handleSubmit = () => {
    const cleanFacilityName = sanitizeText(facilityName.value);

    if (!cleanFacilityName) {
        return;
    }

    emit('add-facility', cleanFacilityName);
    handleClose();
};
</script>

<template>
    <AppModal :is-open="isOpen" @close="handleClose">
        <div class="mb-400">
            <h3 class="text-h4 text-text-primary">Add Facilities</h3>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-400">
            <BaseInput v-model="facilityName" label="Facility Name" placeholder="e.g. Swimming Pool" :required="true" />
            <div class="flex justify-end gap-300 mt-200">
                <BaseButton type="button" variant="secondary" @click="handleClose"> Cancel </BaseButton>
                <BaseButton type="submit" variant="primary"> Add Facility </BaseButton>
            </div>
        </form>
    </AppModal>
</template>
