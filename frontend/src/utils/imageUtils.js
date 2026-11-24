export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const baseUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:8000';

    const cleanPath = path.replace(/^\//, '');
    const storagePath = cleanPath.startsWith('storage/') ? cleanPath : `storage/${cleanPath}`;

    return `${baseUrl.replace(/\/$/, '')}/${storagePath}`;
};

export const normalizeIssueImages = (rawImages) => {
    if (!Array.isArray(rawImages)) return [];

    return [...rawImages]
        .sort((a, b) => (a?.sort_order || 0) - (b?.sort_order || 0))
        .map((img, index) => {
            const path = typeof img === 'string' ? img : (img?.image_path || img?.path || '');
            if (!path) return null;

            return {
                id: img?.id ?? null,
                path,
                url: getImageUrl(path),
                sort_order: img?.sort_order ?? index + 1,
            };
        })
        .filter(Boolean);
};