export const extractYoutubeId = (url: string): string | null => {
    const patterns = [
        /youtu\.be\/([^?&]+)/,
        /youtube\.com\/watch\?v=([^?&]+)/,
        /youtube\.com\/embed\/([^?&]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};