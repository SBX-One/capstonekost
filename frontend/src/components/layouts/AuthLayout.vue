<script setup></script>

<template>
    <main class="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-neutral-50">
        <div class="relative hidden lg:flex flex-col justify-between px-600 pt-600 pb-700 bg-neutral-900 overflow-hidden">
            <div class="absolute inset-0 z-0">
                <img src="@/assets/images/auth/auth-building-cover.webp" alt="Kosanmu Building" class="w-full h-full object-cover object-center" />
                <div class="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20"></div>
            </div>

            <div class="relative z-10 flex items-center">
                <router-link to="/" class="inline-block focus:outline-none rounded-default">
                    <img
                        src="@/assets/images/branding/logo-kosanmu-light.svg"
                        alt="Kosanmu - Platform Manajemen Kos dan Hunian"
                        title="Kosanmu"
                        class="w-33.25 h-11 object-contain select-none"
                        loading="eager"
                        fetchpriority="high"
                    />
                </router-link>
            </div>

            <div class="relative z-10 flex flex-col max-w-md">
                <h1 class="text-h1 text-white">A place that feels like home</h1>
            </div>
        </div>

        <div class="flex items-center justify-center p-600 lg:px-1000 overflow-y-auto">
            <div class="w-full max-w-135 flex flex-col gap-600">
                <slot />
            </div>
        </div>
    </main>
</template>
