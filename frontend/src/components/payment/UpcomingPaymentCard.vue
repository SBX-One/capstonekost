<script setup>
defineProps({
    amountDue: {
        type: String,
        required: true,
    },
    dueDateLabel: {
        type: String,
        default: 'Within 24 hours',
    },
});
</script>

<template>
    <article class="bg-neutral-100 rounded-default p-6 flex flex-col gap-6">
        <h2 class="text-h3 text-text-primary tracking-tight">Upcoming Payment</h2>

        <dl class="flex flex-col gap-4 m-0">
            <div class="grid grid-cols-2 gap-4">
                <dt class="text-h4 text-text-secondary">Amount Due</dt>
                <dt class="text-h4 text-text-secondary">Due Date</dt>
            </div>

            <hr class="border-t border-border-default m-0" />

            <div class="grid grid-cols-2 gap-4">
                <dd class="text-h3 text-text-primary tracking-tight wrap-break-word m-0">
                    {{ amountDue }}
                </dd>
                <dd class="text-h3 text-text-primary tracking-tight m-0">
                    {{ dueDateLabel }}
                </dd>
            </div>
        </dl>
    </article>
</template>
