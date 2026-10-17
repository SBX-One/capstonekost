export function normalizeForComparison(text) {
    if (!text || typeof text !== 'string') return '';
    return text.toLowerCase().replace(/\s+/g, '');
}

export function getTypoDistance(str1, str2) {
    const s1 = String(str1 || '');
    const s2 = String(str2 || '');

    if (s1.length === 0) return s2.length;
    if (s2.length === 0) return s1.length;

    const matrix = Array.from({ length: s2.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= s1.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= s2.length; i++) {
        for (let j = 1; j <= s1.length; j++) {
            if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[s2.length][s1.length];
}