// src/utils/date.ts

export const formatTime = (timeStr: string | null | undefined): string => {
    if (!timeStr) return 'N/A';
    const [hours, minutes] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

export const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) {
        return 'N/A';
    }
    // Assuming dateStr is in 'YYYY-MM-DD' format
    const date = new Date(dateStr + 'T00:00:00Z'); // Use T00:00:00Z to ensure it's parsed as UTC
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC', // Specify UTC timezone
    });
};
