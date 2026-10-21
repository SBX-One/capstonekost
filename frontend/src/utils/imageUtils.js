export const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    const baseUrl = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:8000';

    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};