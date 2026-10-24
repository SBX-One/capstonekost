<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    id: {
        type: String,
        default: null,
    },
    options: {
        type: Array,
        required: true,
    },
    placeholder: {
        type: String,
        default: 'Select option',
    },
    size: {
        type: String,
        default: 'md',
        validator: val => ['sm', 'md'].includes(val),
    },
});

const modelValue = defineModel({ default: '' });
const emit = defineEmits(['update:modelValue', 'blur']);

const isOpen = ref(false);
const activeIndex = ref(-1);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = ref({
    top: '0px',
    left: '0px',
    width: '0px',
});

const isValueMatch = (optVal, currentVal) => {
    if (currentVal === '') return false;
    return String(optVal) === String(currentVal);
};

const selectedLabel = computed(() => {
    const found = props.options.find(opt => {
        const val = typeof opt === 'object' ? opt.value : opt;
        return isValueMatch(val, modelValue.value);
    });
    if (found === undefined || modelValue.value === '') return props.placeholder;
    return typeof found === 'object' ? found.label : found;
});

const triggerSizeClasses = computed(() => {
    return props.size === 'sm' ? 'px-3 py-2 text-body-sm' : 'px-3 py-3 text-body-md';
});

const itemSizeClasses = computed(() => {
    return props.size === 'sm' ? 'px-3 py-1.5 text-body-sm' : 'px-4 py-2 text-body-md';
});

const updatePosition = () => {
    if (triggerRef.value) {
        const rect = triggerRef.value.getBoundingClientRect();
        dropdownStyle.value = {
            top: `${rect.bottom + 6}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
        };
    }
};

const toggleDropdown = async () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        updatePosition();
        activeIndex.value = -1;
        await nextTick();
    } else {
        emit('blur');
    }
};

const selectOption = opt => {
    const val = typeof opt === 'object' ? opt.value : opt;
    modelValue.value = val;
    isOpen.value = false;
    triggerRef.value?.focus();
    emit('blur');
};

const handleKeyDown = e => {
    const totalItems = props.options.length + 1;

    if (!isOpen.value) {
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
            e.preventDefault();
            toggleDropdown();
        }
        return;
    }

    if (e.key === 'Escape') {
        isOpen.value = false;
        triggerRef.value?.focus();
        emit('blur');
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex.value = (activeIndex.value + 1) % totalItems;
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex.value = (activeIndex.value - 1 + totalItems) % totalItems;
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex.value === 0) {
            selectOption('');
        } else if (activeIndex.value > 0) {
            selectOption(props.options[activeIndex.value - 1]);
        }
    }
};

const handleClickOutside = event => {
    if (isOpen.value && triggerRef.value && !triggerRef.value.contains(event.target) && dropdownRef.value && !dropdownRef.value.contains(event.target)) {
        isOpen.value = false;
        emit('blur');
    }
};

onMounted(() => {
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', updatePosition, true);
    document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
    <div class="relative inline-block text-left select-none w-full">
        <button
            :id="id"
            ref="triggerRef"
            type="button"
            @click="toggleDropdown"
            @keydown="handleKeyDown"
            class="w-full flex items-center justify-between gap-4 bg-bg-default border rounded-default transition-colors cursor-pointer focus:outline-none"
            :class="[
                triggerSizeClasses,
                isOpen ? 'border-border-focus bg-neutral-100' : 'border-border-default hover:bg-neutral-100',
                modelValue !== '' ? 'text-text-primary font-semibold' : 'text-text-secondary',
            ]"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
        >
            <span class="truncate">{{ selectedLabel }}</span>
            <svg class="w-4 h-4 text-text-secondary shrink-0 transition-transform duration-200" :class="{ 'rotate-180': isOpen }" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.5 5.83325L7 9.33325L10.5 5.83325" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>

        <Teleport to="body">
            <transition
                enter-active-class="transition ease-out duration-150"
                enter-from-class="transform opacity-0 scale-95 translate-y-2"
                enter-to-class="transform opacity-100 scale-100 translate-y-0"
                leave-active-class="transition ease-in duration-100"
                leave-from-class="transform opacity-100 scale-100 translate-y-0"
                leave-to-class="transform opacity-0 scale-95 translate-y-2"
            >
                <div
                    v-if="isOpen"
                    ref="dropdownRef"
                    :style="dropdownStyle"
                    class="fixed bg-bg-default border border-border-default rounded-default shadow-default z-9999 max-h-60 overflow-y-auto custom-scrollbar flex flex-col"
                    role="listbox"
                >
                    <button
                        type="button"
                        @click="selectOption('')"
                        class="w-full text-left transition-colors shrink-0"
                        :class="[
                            itemSizeClasses,
                            modelValue === '' ? 'bg-neutral-200 font-semibold text-text-primary' : 'text-text-secondary hover:bg-neutral-100',
                            { 'bg-neutral-200': activeIndex === 0 },
                        ]"
                    >
                        {{ placeholder }}
                    </button>

                    <button
                        v-for="(opt, index) in options"
                        :key="index"
                        type="button"
                        @click="selectOption(opt)"
                        class="w-full text-left transition-colors relative shrink-0"
                        :class="[
                            itemSizeClasses,
                            isValueMatch(typeof opt === 'object' ? opt.value : opt, modelValue) ? 'bg-neutral-200 text-text-primary font-semibold pl-6' : 'text-text-primary hover:bg-neutral-100',
                            { 'bg-neutral-100': activeIndex === index + 1 },
                        ]"
                        role="option"
                    >
                        <span v-if="isValueMatch(typeof opt === 'object' ? opt.value : opt, modelValue)" class="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-4 bg-action-primary rounded-full"></span>
                        {{ typeof opt === 'object' ? opt.label : opt }}
                    </button>
                </div>
            </transition>
        </Teleport>
    </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #e5e5e5;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #d4d4d4;
}
</style>
