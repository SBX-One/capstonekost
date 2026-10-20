<script setup></script>

<template>
    <div class="relative w-full aspect-4/5 rounded-xl overflow-hidden shadow-default select-none flex flex-col justify-between p-5 md:p-6 bg-neutral-800 animate-pulse" aria-hidden="true">
        <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/35 via-50% to-transparent pointer-events-none" />
        <div class="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10 pointer-events-none" />

        <div class="relative z-10 flex justify-end items-start w-full">
            <div class="h-6 w-20 rounded-default bg-neutral-700/80" />
        </div>

        <div class="relative z-10 flex flex-col gap-5 md:gap-6">
            <div class="flex flex-col gap-1.5">
                <div class="flex items-center justify-between gap-2">
                    <div class="h-6 w-36 rounded-md bg-neutral-700/90" />
                    <div class="h-6 w-28 rounded-xl bg-neutral-700/60 border border-white/15" />
                </div>

                <div class="space-y-1.5 pt-0.5">
                    <div class="h-4 w-full rounded bg-neutral-700/60" />
                    <div class="h-4 w-4/5 rounded bg-neutral-700/50" />
                </div>
            </div>

            <div class="flex items-baseline gap-1">
                <div class="h-6 w-32 rounded bg-neutral-700/90" />
                <div class="h-3.5 w-12 rounded bg-neutral-700/50" />
            </div>

            <div class="flex items-center gap-2 flex-wrap">
                <div class="h-6 w-24 rounded-xl bg-neutral-700/60 border border-white/15" />
                <div class="h-6 w-16 rounded-xl bg-neutral-700/60 border border-white/15" />
                <div class="h-6 w-16 rounded-xl bg-neutral-700/60 border border-white/15" />
                <div class="h-6 w-7 rounded bg-neutral-700/40" />
            </div>
        </div>
    </div>
</template>
