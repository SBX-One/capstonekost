<script setup></script>

<template>
    <section aria-labelledby="about-heading" class="w-full px-6 md:px-12 bg-bg-default flex flex-col items-center gap-8 md:gap-14">
        <span class="px-4 py-2 w-fit border border-border-default rounded-xl text-body-md text-text-secondary bg-transparent select-none"> About Us </span>

        <div class="flex flex-col items-center gap-16">
            <div class="flex flex-col items-center text-center max-w-3xl gap-5 md:gap-6">
                <h2 id="about-heading" class="text-h3 md:text-h2 text-text-primary tracking-tight">More Than Just a Place to Stay</h2>
                <p class="text-body-md md:text-body-lg text-text-secondary">
                    KOSANMU is a modern boarding house created to provide a comfortable, practical, and welcoming place to live. We offer different room options and essential facilities to support
                    everyday needs, making it easier for residents to find a space that feels right for them.
                </p>
            </div>

            <div class="grid grid-cols-3 items-center gap-4 md:gap-5 lg:gap-6 w-full max-w-xl md:max-w-2xl">
                <div class="flex flex-col gap-3 md:gap-4 lg:gap-5">
                    <div class="relative w-full aspect-square overflow-hidden rounded-xl">
                        <img
                            src="@/assets/images/landing/about/about-bedroom-corner-window.webp"
                            alt="Kosanmu cozy corner bedroom by the window with dark panel"
                            class="absolute inset-0 w-full h-full object-cover object-top"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    <div class="relative w-full aspect-square overflow-hidden rounded-xl">
                        <img
                            src="@/assets/images/landing/about/about-bedroom-warm-panel.webp"
                            alt="Kosanmu bedroom with warm wall lighting and beige headboard"
                            class="absolute inset-0 w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                </div>

                <div class="flex flex-col gap-3 md:gap-4 lg:gap-5">
                    <div class="relative w-full aspect-10/11 overflow-hidden rounded-xl">
                        <img
                            src="@/assets/images/landing/about/about-bedroom-master-ac.webp"
                            alt="Kosanmu spacious master bedroom with air conditioner"
                            class="absolute inset-0 w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    <div class="relative w-full aspect-10/11 overflow-hidden rounded-xl">
                        <img
                            src="@/assets/images/landing/about/about-bedroom-minimalist-art.webp"
                            alt="Kosanmu minimalist bedroom featuring wall frame art"
                            class="absolute inset-0 w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                </div>

                <div class="flex flex-col gap-3 md:gap-4 lg:gap-5">
                    <div class="relative w-full aspect-square overflow-hidden rounded-xl">
                        <img
                            src="@/assets/images/landing/about/about-bedroom-bright-lounge.webp"
                            alt="Kosanmu bright room interior with reading lounge armchair"
                            class="absolute inset-0 w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                    <div class="relative w-full aspect-square overflow-hidden rounded-xl">
                        <img
                            src="@/assets/images/landing/about/about-bedroom-black-headboard.webp"
                            alt="Kosanmu modern room with sleek black headboard"
                            class="absolute inset-0 w-full h-full object-cover object-center"
                            loading="lazy"
                            decoding="async"
                        />
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
