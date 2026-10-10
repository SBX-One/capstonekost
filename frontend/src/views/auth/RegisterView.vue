<script setup>
import AuthLayout from '@/components/layouts/AuthLayout.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
</script>

<template>
    <AuthLayout>
        <div class="flex flex-col gap-50">
            <h2 class="text-h2 text-text-primary">Create Your Account</h2>
            <p class="text-body-lg text-text-secondary">Find a room that feels like home</p>
        </div>

        <RegisterForm />
    </AuthLayout>
</template>
