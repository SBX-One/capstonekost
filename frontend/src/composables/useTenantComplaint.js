import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useTenantComplaintStore } from '@/stores/tenantComplaintStore';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { normalizeIssueImages } from '@/utils/imageUtils';

export const TENANT_COMPLAINT_FILTER_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'progress' },
    { label: 'Resolved', value: 'resolved' },
];

const STATUS_MAP = {
    progress: 'in_progress',
    in_progress: 'in_progress',
    'in progress': 'in_progress',
    resolved: 'resolved',
};

function normalizeStatus(rawStatus) {
    const normalized = String(rawStatus || 'open').toLowerCase().trim();
    return STATUS_MAP[normalized] || 'open';
}

function formatOptionalDate(dateValue) {
    if (!dateValue) return '';
    const formatted = formatDate(dateValue);
    return formatted && formatted !== '-' ? formatted : '';
}

export function useTenantComplaint() {
    const tenantComplaintStore = useTenantComplaintStore();

    const {
        issuesMap,
        issues,
        issueDetails,
        activeRooms,
        isFetching,
        isFetchingDetail,
        isFetchingFormRooms,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalIssues,
    } = storeToRefs(tenantComplaintStore);

    function normalizeIssueCard(item) {
        if (!item) return null;

        const images = normalizeIssueImages(item.image_path || item.image_paths);

        return {
            id: item.id,
            title: item.title || '-',
            description: item.description || '-',
            location: item.location || item.location_name || '-',
            status: normalizeStatus(item.status),
            createdAtLabel: formatDate(item.created_at),
            createdAtDateTimeLabel: formatDateTime(item.created_at),
            images,
            thumbnailUrl: images[0]?.url || '',
            raw: item,
        };
    }

    function normalizeIssueDetail(item) {
        if (!item) return null;

        const info = Array.isArray(item.issues_information)
            ? (item.issues_information[0] || {})
            : (item.issues_information || item);

        const targetId = item.id ?? info.id;
        const fallback = issuesMap.value.get(Number(targetId)) || {};
        const status = normalizeStatus(info.status || item.status || fallback.status);

        const images = normalizeIssueImages(
            info.image_paths || info.image_path || item.image_paths || item.image_path || fallback.image_path
        );

        const adminResponse = item.admin_response && typeof item.admin_response === 'object'
            ? {
                id: item.admin_response.id ?? null,
                description: item.admin_response.response || item.admin_response.description || '',
                images: normalizeIssueImages(item.admin_response.image_paths || item.admin_response.image_path),
            }
            : null;

        const createdAtSource = info.created_at || item.created_at || fallback.created_at;

        const timeline = {
            submittedAt: formatOptionalDate(createdAtSource),
            inProgressAt: formatOptionalDate(
                info.in_progress_at ||
                item.in_progress_at ||
                item.admin_response?.created_at ||
                (status === 'in_progress' ? (info.updated_at || item.updated_at) : null)
            ),
            resolvedAt: formatOptionalDate(
                info.resolved_at ||
                item.resolved_at ||
                (status === 'resolved' ? (info.updated_at || item.updated_at) : null)
            ),
        };

        return {
            id: targetId,
            title: item.title || info.title || fallback.title || '-',
            location: info.location || item.location || fallback.location || '-',
            description: info.description || item.description || fallback.description || '-',
            status,
            createdAtLabel: formatDate(createdAtSource),
            createdAtDateTimeLabel: formatDateTime(createdAtSource),
            images,
            adminResponse,
            timeline,
            raw: item,
        };
    }

    const formattedIssues = computed(() =>
        issues.value.map(normalizeIssueCard).filter(Boolean)
    );

    const activeRoomOptions = computed(() =>
        activeRooms.value
            .filter(room => Number.isInteger(Number(room?.id)) && Number(room.id) > 0)
            .map(room => {
                const numericId = Number(room.id);
                const rawName = room.name ? String(room.name).trim() : `Room ${numericId}`;
                return {
                    id: numericId,
                    value: numericId,
                    label: rawName.toLowerCase().startsWith('room ') ? rawName : `Room ${rawName}`,
                    rawName,
                };
            })
    );

    function getRawIssueDetailById(id) {
        return issueDetails.value.get(Number(id)) || null;
    }

    function getIssueDetailById(id) {
        return normalizeIssueDetail(getRawIssueDetailById(id));
    }

    return {
        issuesMap,
        issues,
        formattedIssues,
        issueDetails,
        activeRooms,
        activeRoomOptions,
        isFetching,
        isFetchingDetail,
        isFetchingFormRooms,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalIssues,

        filterTabs: TENANT_COMPLAINT_FILTER_TABS,
        normalizeIssueCard,
        normalizeIssueDetail,
        getRawIssueDetailById,
        getIssueDetailById,

        fetchIssues: tenantComplaintStore.fetchIssues,
        fetchIssueDetails: tenantComplaintStore.fetchIssueDetails,
        fetchActiveRooms: tenantComplaintStore.fetchActiveRooms,
        createIssue: tenantComplaintStore.createIssue,
        clearError: tenantComplaintStore.clearError,
        clearValidationErrors: tenantComplaintStore.clearValidationErrors,
        clearCache: tenantComplaintStore.clearCache,
    };
}