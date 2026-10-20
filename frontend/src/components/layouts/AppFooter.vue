<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const exploreLinks = [
    { name: 'Home', path: '/' },
    { name: 'About Us', path: '/about' },
    { name: 'Rooms', path: '/tenant/rooms' },
    { name: 'Contact', path: '/contact' },
];

const legalLinks = [
    { name: 'Terms & Conditions', path: '/terms' },
    { name: 'Privacy Policy', path: '/privacy' },
];

const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
    <footer aria-label="Site Footer" class="w-full bg-neutral-900 text-neutral-50 p-10 flex flex-col gap-8 overflow-hidden">
        <div class="w-full flex flex-col gap-6 px-8 md:px-14">
            <div class="flex flex-col md:flex-row justify-between items-start gap-12 md:gap-0 w-full pb-8">
                <nav aria-label="Footer Navigation">
                    <h3 class="text-body-sm font-semibold tracking-wider text-neutral-300 uppercase mb-4 select-none">Explore</h3>
                    <ul class="flex flex-col gap-1">
                        <li v-for="link in exploreLinks" :key="link.name">
                            <RouterLink :to="link.path" class="link-footer">
                                {{ link.name }}
                            </RouterLink>
                        </li>
                    </ul>
                </nav>

                <address class="not-italic">
                    <h3 class="text-body-sm font-semibold tracking-wider text-neutral-300 uppercase mb-4 select-none">Contact</h3>
                    <ul class="flex flex-col gap-1">
                        <li>
                            <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" class="link-footer flex! items-center gap-2 group">
                                <span class="text-neutral-300 group-hover:text-neutral-50 transition-colors">
                                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M18.403 5.63303C17.5713 4.79596 16.5818 4.13222 15.4918 3.68025C14.4018 3.22829 13.233 2.99708 12.053 3.00003C7.105 3.00003 3.077 7.02703 3.075 11.977C3.075 13.559 3.488 15.103 4.273 16.465L3 21.116L7.759 19.867C9.07569 20.5829 10.5503 20.9586 12.049 20.96H12.053C17 20.96 21.028 16.933 21.03 11.983C21.0332 10.8035 20.8027 9.63512 20.3518 8.54522C19.9009 7.45531 19.2385 6.46553 18.403 5.63303ZM12.053 19.445H12.05C10.7135 19.445 9.40171 19.0854 8.252 18.404L7.98 18.242L5.156 18.983L5.909 16.23L5.732 15.948C4.98489 14.7584 4.58934 13.3818 4.591 11.977C4.593 7.86303 7.94 4.51603 12.056 4.51603C13.0364 4.51313 14.0075 4.70506 14.9131 5.08067C15.8186 5.45628 16.6405 6.00809 17.331 6.70403C18.0256 7.39607 18.5762 8.21892 18.9509 9.12503C19.3256 10.0311 19.517 11.0025 19.514 11.983C19.512 16.097 16.165 19.445 12.053 19.445ZM16.146 13.856C15.921 13.743 14.819 13.201 14.613 13.126C14.407 13.051 14.259 13.014 14.109 13.238C13.959 13.462 13.529 13.967 13.398 14.117C13.267 14.267 13.136 14.285 12.912 14.173C12.688 14.061 11.965 13.824 11.108 13.06C10.441 12.465 9.991 11.731 9.86 11.506C9.729 11.281 9.846 11.16 9.959 11.048C10.06 10.948 10.183 10.786 10.295 10.655C10.407 10.524 10.444 10.431 10.519 10.281C10.594 10.131 10.557 10 10.5 9.88803C10.444 9.77503 9.995 8.67103 9.808 8.22203C9.627 7.78703 9.442 7.84503 9.304 7.83903C9.16107 7.83329 9.01804 7.83063 8.875 7.83103C8.7613 7.83416 8.64946 7.86064 8.54641 7.9088C8.44337 7.95697 8.35133 8.0258 8.276 8.11103C8.07 8.33603 7.491 8.87803 7.491 9.98203C7.491 11.086 8.295 12.153 8.407 12.303C8.519 12.453 9.989 14.718 12.239 15.69C12.775 15.921 13.193 16.059 13.518 16.163C14.055 16.334 14.544 16.309 14.931 16.252C15.362 16.188 16.258 15.71 16.445 15.186C16.632 14.662 16.632 14.213 16.576 14.119C16.52 14.025 16.369 13.968 16.146 13.856Z"
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </span>
                                +62 812 3456 7890
                            </a>
                        </li>
                        <li>
                            <a href="mailto:hello@kosanmu.com" class="link-footer flex! items-center gap-2 group">
                                <span class="text-neutral-300 group-hover:text-neutral-50 transition-colors">
                                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M19.25 4H4.75C4.02106 4.00132 3.32236 4.29148 2.80692 4.80692C2.29148 5.32236 2.00132 6.02106 2 6.75V17.25C2.00132 17.9789 2.29148 18.6776 2.80692 19.1931C3.32236 19.7085 4.02106 19.9987 4.75 20H19.25C19.9789 19.9987 20.6776 19.7085 21.1931 19.1931C21.7085 18.6776 21.9987 17.9789 22 17.25V6.75C21.9987 6.02106 21.7085 5.32236 21.1931 4.80692C20.6776 4.29148 19.9789 4.00132 19.25 4ZM4.75 5.5H19.25C19.94 5.5 20.5 6.06 20.5 6.75V7.725L12 12.635L3.5 7.725V6.75C3.5 6.06 4.06 5.5 4.75 5.5ZM19.25 18.5H4.75C4.06 18.5 3.5 17.94 3.5 17.25V9.46L12 14.37L20.5 9.46V17.25C20.5 17.94 19.94 18.5 19.25 18.5Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </span>
                                hello@kosanmu.com
                            </a>
                        </li>
                    </ul>
                </address>

                <address class="not-italic">
                    <h3 class="text-body-sm font-semibold tracking-wider text-neutral-300 uppercase mb-4 select-none">Location</h3>
                    <a
                        href="https://maps.google.com/?q=Denpasar+Bali+Indonesia"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="flex items-start gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-50 rounded-sm w-fit"
                    >
                        <span class="text-neutral-300 group-hover:text-neutral-50 transition-colors mt-1">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M15 10C15 11.6569 13.6569 13 12 13C10.3431 13 9 11.6569 9 10C9 8.34315 10.3431 7 12 7C13.6569 7 15 8.34315 15 10Z"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke="currentColor"
                                />
                                <path
                                    d="M12 2C9.87827 2 7.84344 2.84285 6.34315 4.34315C4.84285 5.84344 4 7.87827 4 10C4 11.892 4.402 13.13 5.5 14.5L12 22L18.5 14.5C19.598 13.13 20 11.892 20 10C20 7.87827 19.1571 5.84344 17.6569 4.34315C16.1566 2.84285 14.1217 2 12 2Z"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke="currentColor"
                                />
                            </svg>
                        </span>

                        <div class="flex flex-col gap-3">
                            <span class="text-body-md md:text-body-lg text-neutral-300 group-hover:text-neutral-50 transition-colors">
                                Jl. Nusa Asri No. 8 <br />
                                Denpasar, Bali, Indonesia
                            </span>

                            <div
                                class="flex items-center gap-1 text-body-md text-neutral-300 group-hover:text-neutral-50 transition-colors w-fit border-b border-transparent group-hover:border-neutral-50 pb-0.5"
                            >
                                View on Google Maps
                                <svg class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M11.75 10.75V4.25H5.25M11.75 4.25L4.25 11.75" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" />
                                </svg>
                            </div>
                        </div>
                    </a>
                </address>
            </div>

            <div class="w-full h-px bg-neutral-800"></div>

            <div class="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-6 text-body-sm text-neutral-300 font-medium">
                <p>&copy; {{ currentYear }} KOSANMU. All Rights Reserved</p>

                <div class="flex items-center gap-4">
                    <template v-for="(link, index) in legalLinks" :key="link.name">
                        <RouterLink :to="link.path" class="hover:text-neutral-50 transition-colors focus-visible:outline-none">
                            {{ link.name }}
                        </RouterLink>
                        <span v-if="index !== legalLinks.length - 1" class="text-neutral-600 select-none">|</span>
                    </template>
                </div>
            </div>
        </div>

        <div class="w-full flex justify-center items-end select-none pointer-events-none mt-auto">
            <h1 class="sr-only">Kosanmu</h1>
            <img src="@/assets/images/branding/logo-kosanmu-footer.svg" alt="Kosanmu" loading="lazy" class="w-full h-auto block" />
        </div>
    </footer>
</template>
