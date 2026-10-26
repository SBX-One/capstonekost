<script setup>
import BaseInput from '@/components/common/BaseInput.vue';

const form = defineModel({ type: Object, required: true });

defineProps({
    errors: {
        type: Object,
        default: () => ({}),
    },
});

defineEmits(['clear', 'validate']);
</script>

<template>
    <section class="bg-white border border-border-default rounded-default p-6 sm:p-10 shadow-default">
        <h2 class="text-h3 text-text-primary mb-2">Contact Information</h2>
        <p class="text-body-md text-text-secondary mb-8">Enter the contact details for this booking.</p>

        <div class="space-y-6">
            <BaseInput
                id="fullName"
                label="Full Name"
                v-model="form.fullName"
                placeholder="Enter your full name..."
                variant="secondary"
                :error="errors.fullName"
                @update:modelValue="$emit('clear', 'fullName')"
                @blur="$emit('validate', 'fullName', form.fullName)"
            />
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <BaseInput
                    id="phoneNumber"
                    label="Phone Number"
                    v-model="form.phoneNumber"
                    placeholder="Enter your phone number..."
                    variant="secondary"
                    :error="errors.phoneNumber"
                    @update:modelValue="$emit('clear', 'phoneNumber')"
                    @blur="$emit('validate', 'phoneNumber', form.phoneNumber)"
                />
                <BaseInput
                    id="emailAddress"
                    label="Email Adress"
                    type="email"
                    v-model="form.email"
                    placeholder="Enter your email adress..."
                    variant="secondary"
                    :error="errors.email"
                    @update:modelValue="$emit('clear', 'email')"
                    @blur="$emit('validate', 'email', form.email)"
                />
            </div>
        </div>
    </section>
</template>
