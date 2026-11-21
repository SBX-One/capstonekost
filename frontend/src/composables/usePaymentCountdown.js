import { ref, computed, watch, onUnmounted, toValue } from 'vue';
import { formatDateTime, parseApiDate } from '@/utils/formatters';

const WARNING_THRESHOLD_SECONDS = 2 * 60 * 60;

export function usePaymentCountdown(deadlineSource) {
    const nowTimestamp = ref(Date.now());
    let intervalId = null;

    const deadlineTimestamp = computed(() => {
        const source = toValue(deadlineSource);
        if (!source) return null;

        const rawDeadline =
            source.payment_deadline ||
            source.initial_payment_deadline ||
            source.deadline ||
            source.expires_at;

        if (rawDeadline) {
            const parsed = parseApiDate(rawDeadline);
            if (parsed.isValid()) return parsed.valueOf();
        }

        const baseTime = source.approved_at || source.updated_at || source.created_at;
        if (baseTime) {
            const parsedBase = parseApiDate(baseTime);
            if (parsedBase.isValid()) {
                return parsedBase.add(24, 'hour').valueOf();
            }
        }

        return null;
    });

    const remainingSeconds = computed(() => {
        if (!deadlineTimestamp.value) return 0;
        const diffMs = deadlineTimestamp.value - nowTimestamp.value;
        return diffMs > 0 ? Math.floor(diffMs / 1000) : 0;
    });

    const isExpired = computed(() => {
        if (!deadlineTimestamp.value) return false;
        return remainingSeconds.value <= 0;
    });

    const isApproaching = computed(() => {
        if (!deadlineTimestamp.value) return false;
        return remainingSeconds.value > 0 && remainingSeconds.value <= WARNING_THRESHOLD_SECONDS;
    });

    const formattedRemainingTime = computed(() => {
        if (!deadlineTimestamp.value) return '--:--:--';
        const total = remainingSeconds.value;
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const seconds = total % 60;

        return [hours, minutes, seconds]
            .map(unit => String(unit).padStart(2, '0'))
            .join(':');
    });

    const formattedDeadline = computed(() => {
        if (!deadlineTimestamp.value) return '-';
        return formatDateTime(deadlineTimestamp.value);
    });

    function stop() {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function start() {
        stop();
        nowTimestamp.value = Date.now();

        if (!deadlineTimestamp.value || deadlineTimestamp.value <= nowTimestamp.value) {
            return;
        }

        intervalId = setInterval(() => {
            nowTimestamp.value = Date.now();
            if (deadlineTimestamp.value && nowTimestamp.value >= deadlineTimestamp.value) {
                stop();
            }
        }, 1000);
    }

    watch(
        deadlineTimestamp,
        newDeadline => {
            if (newDeadline) {
                start();
            } else {
                stop();
            }
        },
        { immediate: true }
    );

    onUnmounted(() => {
        stop();
    });

    return {
        remainingSeconds,
        formattedRemainingTime,
        formattedDeadline,
        isApproaching,
        isExpired,
    };
}