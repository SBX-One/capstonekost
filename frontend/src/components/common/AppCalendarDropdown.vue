<script setup>
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue';
import dayjs from 'dayjs';

const props = defineProps({
    id: {
        type: String,
        default: null,
    },
    placeholder: {
        type: String,
        default: 'Select date',
    },
});

const modelValue = defineModel({ default: '' });
const emit = defineEmits(['blur']);

const isOpen = ref(false);
const triggerRef = ref(null);
const dropdownRef = ref(null);
const dropdownStyle = ref({ top: '0px', left: '0px' });

const currentViewDate = ref(dayjs());
const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

watch(modelValue, newVal => {
    if (newVal && isOpen.value) {
        const d = dayjs(newVal);
        if (d.isValid()) {
            currentViewDate.value = d;
        }
    }
});

const selectedLabel = computed(() => {
    if (!modelValue.value) return props.placeholder;
    const d = dayjs(modelValue.value);
    return d.isValid() ? d.format('D MMM YYYY') : props.placeholder;
});

const currentMonthYearLabel = computed(() => {
    return currentViewDate.value.format('MMMM YYYY');
});

const calendarGrid = computed(() => {
    const days = [];
    const startOfMonth = currentViewDate.value.startOf('month');
    const firstDay = startOfMonth.day();
    const daysInMonth = startOfMonth.daysInMonth();

    const prevMonth = currentViewDate.value.subtract(1, 'month');
    const daysInPrevMonth = prevMonth.daysInMonth();

    for (let i = firstDay - 1; i >= 0; i--) {
        days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, dateStr: '' });
    }

    for (let i = 1; i <= daysInMonth; i++) {
        days.push({
            day: i,
            isCurrentMonth: true,
            dateStr: startOfMonth.date(i).format('YYYY-MM-DD'),
        });
    }

    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ day: i, isCurrentMonth: false, dateStr: '' });
    }

    return days;
});

const changeMonth = offset => {
    currentViewDate.value = currentViewDate.value.add(offset, 'month');
};

let scrollTicking = false;

const updatePosition = async () => {
    if (triggerRef.value && isOpen.value) {
        await nextTick();

        const rect = triggerRef.value.getBoundingClientRect();
        const dropdownEl = dropdownRef.value;

        if (dropdownEl) {
            const dropdownRect = dropdownEl.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;

            let topPos = rect.bottom + 6;
            if (spaceBelow < dropdownRect.height && rect.top > dropdownRect.height) {
                topPos = rect.top - dropdownRect.height - 6;
            }

            let leftPos = rect.left;
            const spaceRight = window.innerWidth - leftPos;

            if (spaceRight < dropdownRect.width + 16) {
                leftPos = window.innerWidth - dropdownRect.width - 16;
            }

            if (leftPos < 16) leftPos = 16;

            dropdownStyle.value = {
                top: `${topPos}px`,
                left: `${leftPos}px`,
            };
        }
    }
};

const onScroll = () => {
    if (!scrollTicking && isOpen.value) {
        window.requestAnimationFrame(() => {
            updatePosition();
            scrollTicking = false;
        });
        scrollTicking = true;
    }
};

const closeDropdown = () => {
    isOpen.value = false;
    emit('blur');
};

const toggleDropdown = async () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        const initDate = dayjs(modelValue.value);
        currentViewDate.value = modelValue.value && initDate.isValid() ? initDate : dayjs();
        updatePosition();
    } else {
        emit('blur');
    }
};

const selectDate = dateStr => {
    if (!dateStr) return;
    modelValue.value = dateStr;
    closeDropdown();
};

const handleGlobalEvents = event => {
    if (!isOpen.value) return;

    if (event.type === 'keydown' && event.key === 'Escape') {
        closeDropdown();
        triggerRef.value?.focus();
        return;
    }

    if (event.type === 'click') {
        const isClickInside = triggerRef.value?.contains(event.target) || dropdownRef.value?.contains(event.target);
        if (!isClickInside) closeDropdown();
    }
};

onMounted(() => {
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', onScroll, true);
    document.addEventListener('click', handleGlobalEvents);
    document.addEventListener('keydown', handleGlobalEvents);
});

onUnmounted(() => {
    window.removeEventListener('resize', updatePosition);
    window.removeEventListener('scroll', onScroll, true);
    document.removeEventListener('click', handleGlobalEvents);
    document.removeEventListener('keydown', handleGlobalEvents);
});
</script>

<template>
    <div class="relative inline-block text-left select-none w-full font-sans">
        <button
            :id="id"
            ref="triggerRef"
            type="button"
            @click="toggleDropdown"
            class="w-full h-13.5 px-4 flex items-center justify-between bg-bg-default border rounded-default transition-colors cursor-pointer focus:outline-none"
            :class="[isOpen ? 'border-border-focus bg-neutral-100' : 'border-border-default hover:bg-neutral-100', modelValue !== '' ? 'text-text-primary' : 'text-text-secondary']"
            aria-haspopup="dialog"
            :aria-expanded="isOpen"
        >
            <div class="flex items-center gap-4">
                <svg class="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g clip-path="url(#clip0_966_9746)">
                        <path
                            d="M22 2.24952H18.75V0.749524C18.7501 0.550611 18.6712 0.359793 18.5307 0.219047C18.3901 0.078301 18.1994 -0.000843776 18.0005 -0.000976384C17.8016 -0.00110899 17.6108 0.0777815 17.47 0.21834C17.3293 0.358898 17.2501 0.549611 17.25 0.748524V2.24952H12.75V0.749524C12.7501 0.651032 12.7307 0.553492 12.6931 0.462473C12.6555 0.371454 12.6003 0.288737 12.5307 0.219047C12.4611 0.149357 12.3784 0.094057 12.2875 0.0563053C12.1965 0.0185536 12.099 -0.000910735 12.0005 -0.000976396C11.8016 -0.001109 11.6108 0.0777815 11.47 0.21834C11.3293 0.358898 11.2501 0.549611 11.25 0.748524V2.24952H6.75V0.749524C6.75007 0.651032 6.73073 0.553492 6.6931 0.462473C6.65547 0.371454 6.60028 0.288737 6.53068 0.219047C6.46109 0.149357 6.37844 0.094057 6.28747 0.0563053C6.19651 0.0185536 6.09899 -0.000910735 6.0005 -0.000976396C5.80159 -0.001109 5.61077 0.0777815 5.47002 0.21834C5.32928 0.358898 5.25013 0.549611 5.25 0.748524V2.24952H2C1.46974 2.24952 0.961184 2.4601 0.58614 2.83496C0.211096 3.20981 0.00026513 3.71826 0 4.24852V21.9985C0 22.529 0.210714 23.0377 0.585786 23.4127C0.960859 23.7878 1.46957 23.9985 2 23.9985H22C22.5304 23.9985 23.0391 23.7878 23.4142 23.4127C23.7893 23.0377 24 22.529 24 21.9985V4.24852C23.9997 3.71826 23.7889 3.20981 23.4139 2.83496C23.0388 2.4601 22.5303 2.24952 22 2.24952ZM22.5 21.9995C22.5 22.132 22.4475 22.259 22.3539 22.3527C22.2604 22.4465 22.1334 22.4993 22.001 22.4995H2C1.86739 22.4995 1.74021 22.4468 1.64645 22.3531C1.55268 22.2593 1.5 22.1321 1.5 21.9995V4.24952C1.50026 4.11709 1.55306 3.99017 1.6468 3.89662C1.74054 3.80306 1.86756 3.75052 2 3.75052H5.25V5.25052C5.24987 5.44944 5.32876 5.64025 5.46932 5.781C5.60988 5.92175 5.80059 6.00089 5.9995 6.00102C6.19841 6.00116 6.38923 5.92227 6.52998 5.78171C6.67072 5.64115 6.74987 5.45044 6.75 5.25152V3.75052H11.25V5.25052C11.2499 5.44944 11.3288 5.64025 11.4693 5.781C11.6099 5.92175 11.8006 6.00089 11.9995 6.00102C12.1984 6.00116 12.3892 5.92227 12.53 5.78171C12.6707 5.64115 12.7499 5.45044 12.75 5.25152V3.75052H17.25V5.25052C17.2499 5.44944 17.3288 5.64025 17.4693 5.781C17.6099 5.92175 17.8006 6.00089 17.9995 6.00102C18.1984 6.00116 18.3892 5.92227 18.53 5.78171C18.6707 5.64115 18.7499 5.45044 18.75 5.25152V3.75052H22C22.1323 3.75079 22.259 3.80345 22.3526 3.89697C22.4461 3.99049 22.4987 4.11726 22.499 4.24952L22.5 21.9995Z"
                            fill="currentColor"
                        />
                        <path
                            d="M5.25 9H8.25V11.25H5.25V9ZM5.25 12.75H8.25V15H5.25V12.75ZM5.25 16.5H8.25V18.75H5.25V16.5ZM10.5 16.5H13.5V18.75H10.5V16.5ZM10.5 12.75H13.5V15H10.5V12.75ZM10.5 9H13.5V11.25H10.5V9ZM15.75 16.5H18.75V18.75H15.75V16.5ZM15.75 12.75H18.75V15H15.75V12.75ZM15.75 9H18.75V11.25H15.75V9Z"
                            fill="currentColor"
                        />
                    </g>
                    <defs>
                        <clipPath id="clip0_966_9746">
                            <rect width="24" height="24" fill="currentColor" />
                        </clipPath>
                    </defs>
                </svg>

                <span class="text-body-lg truncate" :class="{ 'font-medium': modelValue !== '' }">
                    {{ selectedLabel }}
                </span>
            </div>
            <svg
                class="w-2.5 h-4.5 shrink-0 transition-transform duration-200"
                :class="{ 'rotate-180': isOpen, 'text-text-primary': isOpen, 'text-text-secondary': !isOpen }"
                viewBox="0 0 18 10"
                fill="none"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path d="M8.74286 10L0 0H18L8.74286 10Z" fill="currentColor" />
            </svg>
        </button>

        <Teleport to="body">
            <div
                v-if="isOpen"
                ref="dropdownRef"
                :style="dropdownStyle"
                class="fixed w-[calc(100vw-2rem)] sm:w-92.75 max-w-92.75 p-4 bg-bg-default border border-border-default rounded-default z-9999 animate-fadeIn"
                role="dialog"
                aria-label="Calendar dropdown"
            >
                <div class="flex items-center justify-between mb-4 px-2">
                    <button
                        @click="changeMonth(-1)"
                        class="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-default transition-colors focus:outline-none"
                        type="button"
                        aria-label="Previous month"
                    >
                        <svg class="w-2.5 h-4.5 text-text-primary" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0 8.74286L10 0V18L0 8.74286Z" fill="currentColor" />
                        </svg>
                    </button>
                    <span class="text-h4 font-semibold text-text-primary" aria-live="polite">
                        {{ currentMonthYearLabel }}
                    </span>
                    <button
                        @click="changeMonth(1)"
                        class="w-8 h-8 flex items-center justify-center hover:bg-neutral-100 rounded-default transition-colors focus:outline-none"
                        type="button"
                        aria-label="Next month"
                    >
                        <svg class="w-2.5 h-4.5 text-text-primary" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 9.25714L0 18V0L10 9.25714Z" fill="currentColor" />
                        </svg>
                    </button>
                </div>

                <div class="grid grid-cols-7 gap-2">
                    <div v-for="(day, index) in daysOfWeek" :key="'header-' + index" class="text-center text-body-lg font-medium text-text-primary mb-2" aria-hidden="true">
                        {{ day }}
                    </div>

                    <button
                        v-for="(dateObj, index) in calendarGrid"
                        :key="'date-' + index"
                        type="button"
                        :disabled="!dateObj.isCurrentMonth"
                        @click="selectDate(dateObj.dateStr)"
                        class="relative h-10 w-full flex items-center justify-center text-body-lg transition-colors rounded-default focus:outline-none"
                        :class="[!dateObj.isCurrentMonth ? 'text-text-disabled cursor-not-allowed' : 'text-text-primary hover:bg-neutral-100 cursor-pointer']"
                        :aria-label="dateObj.isCurrentMonth ? `Select ${dateObj.dateStr}` : ''"
                    >
                        <span>{{ dateObj.day }}</span>
                        <span v-if="dateObj.isCurrentMonth && modelValue === dateObj.dateStr" class="absolute bottom-1 w-5 h-0.5 bg-neutral-900 rounded-full"></span>
                    </button>
                </div>
            </div>
        </Teleport>
    </div>
</template>
