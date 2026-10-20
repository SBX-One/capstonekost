<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const modelValue = defineModel();

const props = defineProps({
    options: {
        type: Array,
        default: () => [],
    },
    ariaLabel: {
        type: String,
        default: 'Filter Options',
    },
});

const emit = defineEmits(['change']);

const containerRef = ref(null);
const itemRefs = ref([]);
const isAnimated = ref(false);

const indicatorStyle = ref({
    transform: 'translateX(0px)',
    width: '0px',
    opacity: 0,
});

const getVal = opt => (typeof opt === 'object' && opt !== null ? opt.value : opt);
const getLabel = opt => (typeof opt === 'object' && opt !== null ? opt.label : opt);
const findCurrentIndex = () => props.options.findIndex(opt => getVal(opt) === modelValue.value);

const updateIndicator = () => {
    const idx = findCurrentIndex();
    const targetEl = itemRefs.value[idx];

    if (!targetEl || idx === -1) {
        indicatorStyle.value.opacity = 0;
        return;
    }

    indicatorStyle.value = {
        transform: `translateX(${targetEl.offsetLeft}px)`,
        width: `${targetEl.offsetWidth}px`,
        opacity: 1,
    };
};

const selectOption = opt => {
    const val = getVal(opt);
    if (val === modelValue.value) return;
    modelValue.value = val;
    emit('change', val);
};

const onKeyDown = e => {
    const total = props.options.length;
    const currentIdx = findCurrentIndex();
    if (currentIdx === -1) return;

    const keyMap = {
        ArrowRight: (currentIdx + 1) % total,
        ArrowDown: (currentIdx + 1) % total,
        ArrowLeft: (currentIdx - 1 + total) % total,
        ArrowUp: (currentIdx - 1 + total) % total,
        Home: 0,
        End: total - 1,
    };

    if (!(e.key in keyMap)) return;

    e.preventDefault();
    const nextIdx = keyMap[e.key];

    selectOption(props.options[nextIdx]);
    nextTick(() => {
        itemRefs.value[nextIdx]?.focus();
    });
};

let resizeObserver = null;

onMounted(() => {
    nextTick(() => {
        updateIndicator();
        requestAnimationFrame(() => {
            isAnimated.value = true;
        });

        if (document.fonts?.ready) {
            document.fonts.ready.then(updateIndicator);
        }

        if (containerRef.value && typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(updateIndicator);
            resizeObserver.observe(containerRef.value);
        }
    });
});

onBeforeUnmount(() => {
    resizeObserver?.disconnect();
});

watch(modelValue, () => nextTick(updateIndicator));
watch(
    () => props.options,
    () => nextTick(updateIndicator),
    { deep: true }
);
</script>

<template>
    <div class="max-w-full overflow-x-auto scrollbar-none py-1">
        <div ref="containerRef" role="radiogroup" :aria-label="ariaLabel" class="relative inline-flex items-center p-1 bg-neutral-100 rounded-full select-none whitespace-nowrap" @keydown="onKeyDown">
            <div
                class="absolute top-1 bottom-1 left-0 rounded-full bg-neutral-900 pointer-events-none shadow-default will-change-transform"
                :class="isAnimated ? 'transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]' : 'transition-none'"
                :style="indicatorStyle"
                aria-hidden="true"
            />
            <button
                v-for="(option, index) in options"
                :key="getVal(option)"
                :ref="
                    el => {
                        if (el) itemRefs[index] = el;
                    }
                "
                type="button"
                role="radio"
                :aria-checked="getVal(option) === modelValue"
                :tabindex="getVal(option) === modelValue ? 0 : -1"
                class="relative z-10 px-5 md:px-6 py-2 md:py-3 rounded-full text-h5 font-medium transition-colors duration-300 focus:outline-none"
                :class="[getVal(option) === modelValue ? 'text-text-inverse font-semibold' : 'text-text-primary active:scale-95']"
                @click="selectOption(option)"
            >
                {{ getLabel(option) }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar {
    display: none;
}
.scrollbar-none {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
