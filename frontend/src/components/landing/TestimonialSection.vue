<script setup>
import { ref } from 'vue';
const testimonials = ref([
    {
        id: 1,
        quote: '"Everything feels convenient here, from the comfortable room to the facilities. It’s a great place to call home."',
        name: 'Rocky James',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=150&q=80',
    },
    {
        id: 2,
        quote: '"I appreciate the little details that make this place feel special. It’s more than just a room, it’s my comfort zone."',
        name: 'Nicole Kidman',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    },
    {
        id: 3,
        quote: '"I really enjoy living here. The atmosphere is peaceful, and everything feels convenient for my daily routine."',
        name: 'Brian Alexander',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    {
        id: 4,
        quote: '"I love how welcoming this place feels. It’s comfortable, peaceful, and honestly feels just like home."',
        name: 'Catherine Olivia',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
    },
]);

const featuredTestimonial = ref({
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    quote: 'Living at KOSANMU has been such a great experience. The room is cozy, clean, and has everything I need to feel at home.',
    name: 'Samantha Rachel',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
});
</script>

<template>
    <section aria-labelledby="testimonial-heading" class="w-full px-6 md:px-12 py-8 md:py-1200 bg-bg-default flex flex-col items-center gap-8 md:gap-14">
        <span class="px-4 py-2 w-fit border border-border-default rounded-xl text-body-md text-text-secondary bg-transparent select-none"> Testimonials </span>
        <div class="flex flex-col gap-8 md:gap-14 w-full">
            <h2 id="testimonial-heading" class="text-h3 md:text-h2 text-center text-text-primary tracking-tight">What Our Tenant Says</h2>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full items-stretch">
                <article class="lg:col-span-1 relative rounded-xl overflow-hidden group w-full aspect-3/4 lg:aspect-auto lg:h-full min-h-125 flex flex-col isolation-auto">
                    <img
                        :src="featuredTestimonial.image"
                        alt="Portrait of our tenant"
                        loading="lazy"
                        class="absolute inset-0 w-full h-full object-cover transition-transform duration-1200 ease-out group-hover:scale-105"
                    />

                    <div class="absolute inset-x-0 bottom-0 h-[65%] bg-linear-to-t from-black/95 via-black/50 to-transparent pointer-events-none transition-opacity duration-500 z-10"></div>
                    <div class="absolute inset-x-0 bottom-0 h-[55%] backdrop-blur-lg pointer-events-none smooth-blur-mask z-20"></div>

                    <div class="relative z-30 p-5 md:p-6 mt-auto flex flex-col gap-4 text-text-inverse w-full justify-end h-full">
                        <div class="relative w-full flex items-end justify-between gap-4">
                            <blockquote class="text-body-md md:text-body-lg font-medium leading-relaxed max-w-[75%] drop-shadow-sm">
                                {{ featuredTestimonial.quote }}
                            </blockquote>

                            <div class="text-white/20 select-none pointer-events-none shrink-0">
                                <svg class="w-15 h-15" viewBox="0 0 60 60" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M14.9752 34.8246C16.0252 34.8246 17.0502 34.6496 18.0252 34.3996C17.8002 35.1496 17.6002 35.9246 17.2252 36.5996C16.9502 37.3746 16.5002 38.0496 16.0502 38.6996C15.6752 39.4246 15.0252 39.9246 14.5502 40.5496C14.0502 41.1496 13.3752 41.5496 12.8252 42.0496C12.3002 42.5746 11.6002 42.8496 11.0502 43.1996C10.4752 43.5246 9.9752 43.8996 9.4252 44.0746C8.9002 44.2996 8.4502 44.4746 8.0752 44.6246C7.3252 44.9246 6.9002 45.1246 6.9002 45.1246L8.1002 49.9746C8.1002 49.9746 8.6502 49.8496 9.60019 49.6246C10.0752 49.4996 10.6502 49.3746 11.3252 49.1996C12.0002 49.0746 12.7252 48.7246 13.5252 48.4246C14.3252 48.0746 15.2502 47.8246 16.1002 47.2496C16.9502 46.6996 17.9502 46.2496 18.8252 45.5246C19.6752 44.7746 20.7002 44.1246 21.4502 43.1746C22.2752 42.2746 23.1002 41.3496 23.7252 40.2746C24.4502 39.2496 24.9502 38.1246 25.4752 37.0246C25.9502 35.9246 26.3252 34.7746 26.6502 33.6746C27.2502 31.4746 27.5002 29.3746 27.6002 27.5746C27.6752 25.7746 27.6252 24.2746 27.5252 23.1996C27.4752 22.6996 27.4252 22.1996 27.3752 21.8496L27.3002 21.4246C26.8002 15.0246 21.5252 9.97461 14.9752 9.97461C8.1252 9.97461 2.5752 15.5246 2.5752 22.3746C2.5752 29.2246 8.1252 34.7746 14.9752 34.7746V34.8246ZM44.9002 34.8246C45.9502 34.8246 46.9752 34.6496 47.9502 34.3996C47.7252 35.1496 47.5252 35.9246 47.1502 36.5996C46.8752 37.3746 46.4252 38.0496 45.9752 38.6996C45.6002 39.4246 44.9502 39.9246 44.4752 40.5496C43.9752 41.1496 43.3002 41.5496 42.7502 42.0496C42.2252 42.5746 41.5252 42.8496 40.9752 43.1996C40.4002 43.5246 39.9002 43.8996 39.3502 44.0746C38.8252 44.2996 38.3752 44.4746 38.0002 44.6246C37.2502 44.9246 36.8252 45.1246 36.8252 45.1246L38.0252 49.9746C38.0252 49.9746 38.5752 49.8496 39.5252 49.6246C40.0002 49.4996 40.5752 49.3746 41.2502 49.1996C41.9252 49.0746 42.6502 48.7246 43.4502 48.4246C44.2502 48.0746 45.1752 47.8246 46.0252 47.2496C46.8752 46.6996 47.8752 46.2496 48.7502 45.5246C49.6002 44.7746 50.6252 44.1246 51.3752 43.1746C52.2002 42.2746 53.0252 41.3496 53.6502 40.2746C54.3752 39.2496 54.8752 38.1246 55.4002 37.0246C55.8752 35.9246 56.2502 34.7746 56.5752 33.6746C57.1752 31.4746 57.4252 29.3746 57.5252 27.5746C57.6002 25.7746 57.5502 24.2746 57.4502 23.1996C57.4002 22.6996 57.3502 22.1996 57.3002 21.8496L57.2252 21.4246C56.7252 15.0246 51.4502 9.97461 44.9002 9.97461C38.0502 9.97461 32.5002 15.5246 32.5002 22.3746C32.5002 29.2246 38.0502 34.7746 44.9002 34.7746V34.8246Z"
                                        fill="currentColor"
                                    />
                                </svg>
                            </div>
                        </div>

                        <div class="flex items-center gap-4">
                            <img :src="featuredTestimonial.avatar" :alt="`Avatar of ${featuredTestimonial.name}`" class="w-10 h-10 rounded-full object-cover" />
                            <cite class="text-h5 tracking-wide not-italic text-text-inverse">{{ featuredTestimonial.name }}</cite>
                        </div>
                    </div>
                </article>

                <div class="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 h-full">
                    <article
                        v-for="testi in testimonials"
                        :key="testi.id"
                        class="bg-neutral-100 rounded-xl py-6 md:py-8 px-8 md:px-10 flex flex-col gap-6 transition-all duration-300 hover:-translate-y-1 h-full"
                    >
                        <div class="text-action-disabled select-none pointer-events-none">
                            <svg class="w-8 h-8" viewBox="0 0 32 32" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M7.98687 18.5736C8.54687 18.5736 9.09353 18.4803 9.61353 18.347C9.49354 18.747 9.38687 19.1603 9.18687 19.5203C9.0402 19.9336 8.8002 20.2936 8.5602 20.6403C8.3602 21.027 8.01353 21.2936 7.7602 21.627C7.49353 21.947 7.13354 22.1603 6.8402 22.427C6.5602 22.707 6.18687 22.8536 5.89354 23.0403C5.58687 23.2136 5.3202 23.4136 5.02687 23.507C4.74687 23.627 4.50687 23.7203 4.30687 23.8003C3.90687 23.9603 3.6802 24.067 3.6802 24.067L4.3202 26.6536C4.3202 26.6536 4.61353 26.587 5.1202 26.467C5.37353 26.4003 5.6802 26.3336 6.0402 26.2403C6.4002 26.1736 6.78687 25.987 7.21353 25.827C7.6402 25.6403 8.13353 25.507 8.58687 25.2003C9.0402 24.907 9.57353 24.667 10.0402 24.2803C10.4935 23.8803 11.0402 23.5336 11.4402 23.027C11.8802 22.547 12.3202 22.0536 12.6535 21.4803C13.0402 20.9336 13.3069 20.3336 13.5869 19.747C13.8402 19.1603 14.0402 18.547 14.2135 17.9603C14.5335 16.787 14.6669 15.667 14.7202 14.707C14.7602 13.747 14.7335 12.947 14.6802 12.3736C14.6535 12.107 14.6269 11.8403 14.6002 11.6536L14.5602 11.427C14.2935 8.01365 11.4802 5.32031 7.98687 5.32031C4.33353 5.32031 1.37354 8.28031 1.37354 11.9336C1.37354 15.587 4.33353 18.547 7.98687 18.547V18.5736ZM23.9469 18.5736C24.5069 18.5736 25.0535 18.4803 25.5735 18.347C25.4535 18.747 25.3469 19.1603 25.1469 19.5203C25.0002 19.9336 24.7602 20.2936 24.5202 20.6403C24.3202 21.027 23.9735 21.2936 23.7202 21.627C23.4535 21.947 23.0935 22.1603 22.8002 22.427C22.5202 22.707 22.1469 22.8536 21.8535 23.0403C21.5469 23.2136 21.2802 23.4136 20.9869 23.507C20.7069 23.627 20.4669 23.7203 20.2669 23.8003C19.8669 23.9603 19.6402 24.067 19.6402 24.067L20.2802 26.6536C20.2802 26.6536 20.5735 26.587 21.0802 26.467C21.3335 26.4003 21.6402 26.3336 22.0002 26.2403C22.3602 26.1736 22.7469 25.987 23.1735 25.827C23.6002 25.6403 24.0935 25.507 24.5469 25.2003C25.0002 24.907 25.5335 24.667 26.0002 24.2803C26.4535 23.8803 27.0002 23.5336 27.4002 23.027C27.8402 22.547 28.2802 22.0536 28.6135 21.4803C29.0002 20.9336 29.2669 20.3336 29.5469 19.747C29.8002 19.1603 30.0002 18.547 30.1735 17.9603C30.4935 16.787 30.6269 15.667 30.6802 14.707C30.7202 13.747 30.6935 12.947 30.6402 12.3736C30.6135 12.107 30.5869 11.8403 30.5602 11.6536L30.5202 11.427C30.2535 8.01365 27.4402 5.32031 23.9469 5.32031C20.2935 5.32031 17.3335 8.28031 17.3335 11.9336C17.3335 15.587 20.2935 18.547 23.9469 18.547V18.5736Z"
                                    fill="currentColor"
                                />
                            </svg>
                        </div>

                        <blockquote class="text-h5 md:text-h4 text-text-primary leading-relaxed grow">
                            {{ testi.quote }}
                        </blockquote>

                        <div class="flex items-center gap-4">
                            <img :src="testi.avatar" :alt="`Avatar of ${testi.name}`" loading="lazy" class="w-10 h-10 rounded-full object-cover" />
                            <cite class="text-h5 font-bold text-text-primary not-italic">{{ testi.name }}</cite>
                        </div>
                    </article>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.isolation-auto {
    isolation: isolate;
}

.smooth-blur-mask {
    -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%);
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 60%, rgba(0, 0, 0, 0) 100%);
}
</style>
