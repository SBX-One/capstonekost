import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useAdminComplaintStore } from '@/stores/adminComplaintStore';
import { formatDate, formatDateTime } from '@/utils/formatters';
import { normalizeIssueImages } from '@/utils/imageUtils';

export const ADMIN_COMPLAINT_FILTER_TABS = [
    { label: 'All', value: 'all' },
    { label: 'Open', value: 'open' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Resolved', value: 'resolved' },
];

export function useAdminComplaint() {
    const adminComplaintStore = useAdminComplaintStore();

    const {
        issuesMap,
        issues,
        issueDetails,
        isFetching,
        isFetchingDetail,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalIssues,
    } = storeToRefs(adminComplaintStore);

    function normalizeIssueRow(item) {
        if (!item) return null;

        const images = normalizeIssueImages(item.image_path || item.image_paths);

        return {
            id: item.id,
            title: item.title || '-',
            tenantName: item.tenant_name || '-',
            description: item.description || '-',
            location: item.location || item.location_name || '-',
            status: String(item.status || 'open').toLowerCase().trim(),
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

        const tenant = Array.isArray(item.tenant_information)
            ? (item.tenant_information[0] || {})
            : (item.tenant_information || {});

        const targetId = item.id ?? info.id;
        const fallback = issuesMap.value.get(Number(targetId)) || {};
        const images = normalizeIssueImages(
            info.image_path || info.image_paths || item.image_path || item.image_paths || fallback.image_path
        );

        const adminResponse = item.admin_response && typeof item.admin_response === 'object'
            ? {
                id: item.admin_response.id ?? null,
                description: item.admin_response.description || item.admin_response.response || '-',
                images: normalizeIssueImages(item.admin_response.image_path || item.admin_response.image_paths),
            }
            : null;

        return {
            id: targetId,
            title: item.title || info.title || fallback.title || '-',
            tenantName: tenant.name || item.tenant_name || fallback.tenant_name || '-',
            tenantEmail: tenant.email || '-',
            tenantPhone: tenant.phone || '-',
            location: info.location || item.location || fallback.location || '-',
            description: info.description || item.description || fallback.description || '-',
            status: String(fallback.status || info.status || item.status || 'open').toLowerCase().trim(),
            createdAtLabel: formatDate(info.created_at || item.created_at || fallback.created_at),
            createdAtDateTimeLabel: formatDateTime(info.created_at || item.created_at || fallback.created_at),
            images,
            adminResponse,
            raw: item,
        };
    }

    const formattedIssues = computed(() =>
        issues.value.map(normalizeIssueRow).filter(Boolean)
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
        isFetching,
        isFetchingDetail,
        isMutating,
        error,
        validationErrors,
        totalCount,
        totalIssues,

        filterTabs: ADMIN_COMPLAINT_FILTER_TABS,
        normalizeIssueRow,
        normalizeIssueDetail,
        getRawIssueDetailById,
        getIssueDetailById,

        fetchIssues: adminComplaintStore.fetchIssues,
        fetchIssueDetails: adminComplaintStore.fetchIssueDetails,
        startHandlingIssue: adminComplaintStore.startHandlingIssue,
        resolveIssue: adminComplaintStore.resolveIssue,
        clearError: adminComplaintStore.clearError,
        clearValidationErrors: adminComplaintStore.clearValidationErrors,
        clearCache: adminComplaintStore.clearCache,
    };
}