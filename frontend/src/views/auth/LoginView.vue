<script setup>
import LoginForm from '@/components/auth/LoginForm.vue';
</script>

<template>
    <div class="flex flex-col gap-50">
        <h2 class="text-h2 text-text-primary">Welcome Back</h2>
        <p class="text-body-lg text-text-secondary">Please enter your details to sign in</p>
    </div>

    <LoginForm />
</template>
