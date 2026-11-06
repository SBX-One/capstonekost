<script setup>
defineProps({
    value: {
        type: [String, Number],
        required: true,
    },
    label: {
        type: String,
        required: true,
    },
    iconName: {
        type: String,
        default: 'door',
        validator: val => ['door', 'clock', 'invoice'].includes(val),
    },
});
</script>

<template>
    <div class="bg-surface-default rounded-default p-4 flex flex-col gap-3 justify-between h-full">
        <div class="w-10 h-10 rounded-full bg-bg-default flex items-center justify-center shrink-0">
            <svg v-if="iconName === 'door'" class="w-3 h-3 text-text-primary" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M8.13229 5.99813C8.13229 6.072 8.11566 6.14515 8.08336 6.21339C8.05105 6.28164 8.00369 6.34365 7.94399 6.39589C7.88429 6.44813 7.81342 6.48956 7.73542 6.51783C7.65742 6.5461 7.57382 6.56065 7.48939 6.56065C7.40496 6.56065 7.32136 6.5461 7.24336 6.51783C7.16536 6.48956 7.09449 6.44813 7.03479 6.39589C6.97509 6.34365 6.92773 6.28164 6.89543 6.21339C6.86312 6.14515 6.84649 6.072 6.84649 5.99813C6.84649 5.84893 6.91422 5.70585 7.03479 5.60036C7.15536 5.49487 7.31888 5.4356 7.48939 5.4356C7.6599 5.4356 7.82342 5.49487 7.94399 5.60036C8.06456 5.70585 8.13229 5.84893 8.13229 5.99813ZM5.66183 0.00836243C5.59939 -0.00337231 5.53474 -0.00274957 5.47262 0.010185C5.41049 0.0231195 5.35245 0.048039 5.30274 0.0831216C5.25303 0.118204 5.21291 0.162563 5.18531 0.212955C5.15771 0.263348 5.14333 0.318499 5.14322 0.374379V11.6249C5.1432 11.6808 5.15749 11.7361 5.18503 11.7865C5.21258 11.837 5.25268 11.8815 5.3024 11.9166C5.35213 11.9518 5.41021 11.9768 5.47241 11.9898C5.5346 12.0027 5.59932 12.0034 5.66183 11.9916L11.6623 10.8658C11.7581 10.8476 11.8439 10.8012 11.9054 10.7343C11.9669 10.6675 12.0003 10.5841 12 10.4983V1.49793C11.9998 1.41226 11.9661 1.32922 11.9045 1.26262C11.8429 1.19603 11.7571 1.1499 11.6614 1.13191L5.66183 0.00836243ZM6.00043 11.1606V0.837899L11.1437 1.80169V10.1961L6.00043 11.1606ZM4.28773 11.2469V10.4968H0.857204V1.50018H4.28773V0.750145H0.428602C0.31493 0.750145 0.205913 0.789656 0.125535 0.859985C0.0451562 0.930314 0 1.0257 0 1.12516V10.8718C0 10.9713 0.0451562 11.0667 0.125535 11.137C0.205913 11.2073 0.31493 11.2469 0.428602 11.2469H4.28773Z"
                    fill="currentColor"
                />
            </svg>

            <svg v-else-if="iconName === 'clock'" class="w-3 h-3 text-text-primary" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M0 6C0 9.309 2.691 12 6 12C9.309 12 12 9.309 12 6C12 2.691 9.309 0 6 0C2.691 0 0 2.691 0 6ZM0.9 6C0.9 3.189 3.189 0.9 6 0.9C8.811 0.9 11.1 3.189 11.1 6C11.1 8.811 8.811 11.1 6 11.1C3.189 11.1 0.9 8.811 0.9 6ZM5.55 6.186L7.632 8.268L8.268 7.632L6.45 5.814V2.697H5.55V6.186Z"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    fill="currentColor"
                />
            </svg>

            <svg v-else-if="iconName === 'invoice'" class="w-3 h-3 text-text-primary" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_3930_38287)">
                    <mask id="mask0_3930_38287" style="mask-type: luminance" maskUnits="userSpaceOnUse" x="0" y="0" width="12" height="12">
                        <path d="M0 0H12V12H0V0Z" fill="white" />
                        <path
                            d="M8.75 11.75C10.4069 11.75 11.75 10.4069 11.75 8.75C11.75 7.09315 10.4069 5.75 8.75 5.75C7.09315 5.75 5.75 7.09315 5.75 8.75C5.75 10.4069 7.09315 11.75 8.75 11.75Z"
                            fill="currentColor"
                        />
                    </mask>
                    <g mask="url(#mask0_3930_38287)">
                        <path
                            d="M4.375 3.875H7.625M4.375 5.625H6.375M4.375 7.5H7.625M3.375 1.375H8.625C8.89022 1.375 9.14457 1.48036 9.33211 1.66789C9.51964 1.85543 9.625 2.10978 9.625 2.375V10.625L8.425 9.875L7.2 10.625L6 9.875L4.8 10.625L3.575 9.875L2.375 10.625V2.375C2.375 2.10978 2.48036 1.85543 2.66789 1.66789C2.85543 1.48036 3.10978 1.375 3.375 1.375Z"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke="currentColor"
                        />
                    </g>
                    <path
                        d="M10.5 8.75C10.5 9.7165 9.7165 10.5 8.75 10.5C7.7835 10.5 7 9.7165 7 8.75C7 7.7835 7.7835 7 8.75 7C9.7165 7 10.5 7.7835 10.5 8.75Z"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke="currentColor"
                    />
                    <path d="M8.75 7.875V8.75L9.375 9.25" stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" />
                </g>
                <defs>
                    <clipPath id="clip0_3930_38287">
                        <rect width="12" height="12" fill="currentColor" />
                    </clipPath>
                </defs>
            </svg>
        </div>

        <div class="flex flex-col gap-6">
            <h3 class="text-h3 text-text-primary tracking-tight">
                {{ value }}
            </h3>
            <p class="text-body-md text-text-secondary">
                {{ label }}
            </p>
        </div>
    </div>
</template>
