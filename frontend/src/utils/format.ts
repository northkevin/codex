import { formatDistance, format } from 'date-fns'
export function formatDuration(iso8601Duration: string | null) {
    if (!iso8601Duration) return 'unknown'

    const match = iso8601Duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
    if (!match) return iso8601Duration

    const hours = (match[1] || '').replace('H', '')
    const minutes = (match[2] || '').replace('M', '')
    const seconds = (match[3] || '').replace('S', '')

    return [
        hours && `${hours}h`,
        minutes && `${minutes}m`,
        seconds && `${seconds}s`,
    ]
        .filter(Boolean)
        .join(' ')
}

export function formatTimeSpan(start: Date | null, end: Date | null): string {
    if (!start || !end) return 'N/A'
    return formatDistance(new Date(start), new Date(end))
}

export function formatDateRange(start: Date | null, end: Date | null): string {
    if (!start || !end) return ''
    return `${format(new Date(start), 'MMM yyyy')} - ${format(new Date(end), 'MMM yyyy')}`
}
