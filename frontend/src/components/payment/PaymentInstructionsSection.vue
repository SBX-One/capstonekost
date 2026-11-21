<script setup>
defineProps({
    title: {
        type: String,
        default: 'Payment Instructions',
    },
    subtitle: {
        type: String,
        default: 'Payment is made directly to the property admin',
    },
});
</script>

<template>
    <section aria-labelledby="payment-instructions-heading" class="flex flex-col gap-6">
        <header class="flex flex-col gap-1">
            <h2 id="payment-instructions-heading" class="text-h3 text-text-primary tracking-tight">
                {{ title }}
            </h2>
            <p class="text-body-lg text-text-secondary">
                {{ subtitle }}
            </p>
        </header>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article class="bg-neutral-100 rounded-default p-6 flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <svg class="w-6 h-6 text-text-primary shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path
                            d="M3 5H21C21.5523 5 22 5.44772 22 6V18C22 18.5523 21.5523 19 21 19H3C2.44772 19 2 18.5523 2 18V6C2 5.44772 2.44772 5 3 5Z"
                            stroke-width="2"
                            stroke-linejoin="round"
                            stroke="currentColor"
                        />
                        <path d="M2 10H22M2 8.5V11.5M22 8.5V11.5M14.5 14.5H18.5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" />
                    </svg>

                    <h3 class="text-h3 text-text-primary tracking-tight">Bank Transfer</h3>
                </div>

                <p class="text-body-lg text-text-secondary">
                    Complete your rental payment through a bank transfer directly to the property admin. Contact the admin to obtain the bank account details and confirm the exact amount due. After
                    completing the transfer, notify the admin so your payment can be verified and recorded in the system.
                </p>
            </article>

            <article class="bg-neutral-100 rounded-default p-6 flex flex-col gap-4">
                <div class="flex items-center gap-2">
                    <svg class="w-6 h-6 text-text-primary shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                        <path d="M2.75 4.75H21.25V16.25H2.75V4.75Z" stroke-width="1.5" stroke-miterlimit="2" stroke-linecap="square" stroke="currentColor" />
                        <path
                            d="M14.5 10.5C14.5 11.8807 13.3807 13 12 13C10.6193 13 9.5 11.8807 9.5 10.5C9.5 9.11929 10.6193 8 12 8C13.3807 8 14.5 9.11929 14.5 10.5Z"
                            stroke-width="1.5"
                            stroke-miterlimit="2"
                            stroke-linecap="square"
                            stroke="currentColor"
                        />
                        <path d="M5.75 10.5H5.76M18.25 10.5H18.26" stroke-width="2" stroke-miterlimit="2" stroke-linecap="square" stroke="currentColor" />
                        <path d="M5.25 19.25H18.75" stroke-width="1.5" stroke-miterlimit="2" stroke-linecap="square" stroke="currentColor" />
                    </svg>

                    <h3 class="text-h3 text-text-primary tracking-tight">Cash</h3>
                </div>

                <p class="text-body-lg text-text-secondary">
                    Complete your rental payment in cash by handing it directly to the property admin. Contact the admin to coordinate the payment and confirm the exact amount due. After handing over
                    the payment, notify the admin so your payment can be verified and recorded in the system.
                </p>
            </article>
        </div>
    </section>
</template>
