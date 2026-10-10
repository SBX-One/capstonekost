<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import BaseInput from '@/components/common/BaseInput.vue';
import BaseButton from '@/components/common/BaseButton.vue';

const router = useRouter();
const authStore = useAuthStore();

const form = reactive({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
});

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

const handleRegister = async () => {
    errorMessage.value = '';
    isLoading.value = true;

    try {
        await authStore.register({
            name: form.fullName,
            email: form.email,
            phone: form.phoneNumber,
            password: form.password,
        });

        router.push('/tenant/dashboard');
    } catch (err) {
        errorMessage.value = err.response?.data?.message || 'Gagal mendaftarkan akun. Silakan coba beberapa saat lagi.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <form @submit.prevent="handleRegister" class="flex flex-col gap-600 w-full" novalidate>
        <div class="flex flex-col gap-500">
            <div v-if="errorMessage" class="flex items-center gap-2 p-3 bg-status-error/10 border border-status-error rounded-default text-body-sm text-status-error">
                <svg class="shrink-0 w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke-width="2" stroke="#DC2626" />
                    <path d="M12 7V13M12 16.5V17" stroke-width="2" stroke-linecap="round" stroke="#DC2626" />
                </svg>
                <span>{{ errorMessage }}</span>
            </div>

            <BaseInput id="register-fullname" v-model="form.fullName" type="text" label="Full Name" placeholder="e.g. Stipen Bieber" :disabled="isLoading" required />

            <BaseInput id="register-email" v-model="form.email" type="email" label="Email" placeholder="e.g. stipen@email.com" :disabled="isLoading" required />

            <BaseInput id="register-phone" v-model="form.phoneNumber" type="tel" label="Phone Number" placeholder="e.g. 0812 3456 7890" :disabled="isLoading" required />

            <BaseInput
                id="register-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="Password"
                placeholder="Enter your password"
                show-icon-right
                :disabled="isLoading"
                required
            >
                <template #icon-right>
                    <button
                        type="button"
                        @click="showPassword = !showPassword"
                        class="text-text-disabled hover:text-text-primary focus:outline-none cursor-pointer flex items-center justify-center"
                        :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    >
                        <svg v-if="showPassword" class="w-400 h-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M21.2571 13.038C21.7311 12.419 21.7311 11.582 21.2571 10.962C19.7641 9.013 16.1821 5 12.0001 5C7.81806 5 4.23606 9.013 2.74306 10.962C2.51211 11.2587 2.38672 11.624 2.38672 12C2.38672 12.376 2.51211 12.7413 2.74306 13.038C4.23606 14.987 7.81806 19 12.0001 19C16.1821 19 19.7641 14.987 21.2571 13.038Z"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <path
                                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>

                        <svg v-else class="w-400 h-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M6.87345 17.129C5.02845 15.819 3.56845 14.115 2.74345 13.039C2.51226 12.7422 2.38672 12.3767 2.38672 12.0005C2.38672 11.6243 2.51226 11.2588 2.74345 10.962C4.23645 9.013 7.81845 5 12.0004 5C13.8764 5 15.6304 5.807 17.1304 6.874"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                            <path
                                d="M14.13 9.887C13.8523 9.60467 13.5214 9.38011 13.1565 9.22629C12.7916 9.07246 12.3998 8.99241 12.0038 8.99075C11.6078 8.98909 11.2154 9.06586 10.8491 9.21662C10.4829 9.36738 10.1502 9.58916 9.87016 9.86915C9.5901 10.1492 9.36824 10.4818 9.21739 10.848C9.06654 11.2142 8.98969 11.6066 8.99125 12.0026C8.99282 12.3986 9.07278 12.7904 9.22652 13.1554C9.38026 13.5203 9.60473 13.8512 9.887 14.129M4 20L20 4M10 18.704C10.6491 18.8976 11.3226 18.9972 12 19C16.182 19 19.764 14.987 21.257 13.038C21.4876 12.7407 21.6127 12.3751 21.6125 11.9988C21.6124 11.6226 21.4869 11.2571 21.256 10.96C20.7312 10.2756 20.1683 9.6212 19.57 9"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            />
                        </svg>
                    </button>
                </template>
            </BaseInput>
        </div>

        <div class="flex flex-col gap-400">
            <BaseButton variant="primary" size="lg" block type="submit" :disabled="isLoading">
                {{ isLoading ? 'Creating Account...' : 'Create Account' }}
            </BaseButton>

            <p class="text-center text-label-btn-md text-text-secondary">
                Already have an account?
                <router-link to="/login" class="text-text-primary font-semibold hover:underline focus:outline-none"> Sign In </router-link>
            </p>
        </div>
    </form>
</template>
