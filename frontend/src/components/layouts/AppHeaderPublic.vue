<script setup>
import { ref } from 'vue';
import { useRoomFilter } from '@/composables/useRoomFilter';
import BaseButton from '@/components/common/BaseButton.vue';

const props = defineProps({
    withSearch: {
        type: Boolean,
        default: false,
    },
});

const { search } = useRoomFilter();
const searchInput = ref(null);

const onSearchSubmit = () => {
    searchInput.value?.blur();
};
</script>

<template>
    <header class="sticky top-4 md:top-6 z-50 bg-neutral-100 rounded-xl w-full max-w-7xl mx-auto">
        <nav aria-label="Main Navigation" class="py-2 px-4 md:px-8 flex items-center justify-between">
            <div class="flex items-center">
                <router-link to="/" aria-label="Go to Kosanmu Homepage">
                    <img src="@/assets/images/branding/logo-kosanmu-dark.svg" alt="Kosanmu Logo" class="h-8 w-auto" />
                </router-link>
            </div>

            <div v-if="withSearch" class="hidden md:flex flex-1 max-w-xl mx-8">
                <form @submit.prevent="onSearchSubmit" role="search" class="relative w-full">
                    <label for="room-search" class="sr-only">Search for your room</label>

                    <div class="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none" aria-hidden="true">
                        <svg class="h-4 w-4 text-text-secondary" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M8.74984 15.8341C10.3998 15.8341 11.9248 15.2591 13.1248 14.3091L16.6665 17.8508L17.8415 16.6758L14.2998 13.1341C15.286 11.8889 15.8233 10.3475 15.8248 8.75911C15.8248 4.85078 12.6498 1.67578 8.7415 1.67578C4.83317 1.67578 1.6665 4.84245 1.6665 8.75078C1.6665 12.6591 4.8415 15.8341 8.74984 15.8341ZM8.74984 3.33411C11.7332 3.33411 14.1665 5.76745 14.1665 8.75078C14.1665 11.7341 11.7332 14.1674 8.74984 14.1674C5.7665 14.1674 3.33317 11.7341 3.33317 8.75078C3.33317 5.76745 5.7665 3.33411 8.74984 3.33411Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>

                    <input
                        id="room-search"
                        ref="searchInput"
                        type="search"
                        v-model="search"
                        class="peer block w-full pl-6 pr-9 py-3 bg-neutral-200 border border-border-default rounded-xl text-body-md text-text-primary placeholder:text-neutral-600 focus:outline-none focus:border-border-focus transition-all [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                        placeholder="find your room!"
                        autocomplete="off"
                    />

                    <button
                        v-if="search && search.length > 0"
                        type="button"
                        @click="search = ''"
                        aria-label="Clear search input"
                        class="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary focus:outline-none rounded-full"
                    >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </form>
            </div>

            <div class="flex items-center gap-4">
                <router-link to="/register">
                    <BaseButton variant="primary" size="sm"> Sign Up </BaseButton>
                </router-link>

                <router-link to="/login">
                    <BaseButton variant="secondary" size="sm"> Log In </BaseButton>
                </router-link>
            </div>
        </nav>
    </header>
</template>
