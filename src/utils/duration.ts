export function parseDuration(iso8601: string): number {
    const matches = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!matches) return 0

    const [_, hours, minutes, seconds] = matches
    return (
        parseInt(hours || '0') * 3600 +
        parseInt(minutes || '0') * 60 +
        parseInt(seconds || '0')
    )
}

export function compareDurations(a: string, b: string): number {
    return parseDuration(a) - parseDuration(b)
}

export function formatDuration(iso8601: string): string {
    const seconds = parseDuration(iso8601)
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60

    return [h && `${h}h`, m && `${m}m`, s && `${s}s`].filter(Boolean).join(' ')
}

export function addDurations(a: string, b: string): string {
    const totalSeconds = parseDuration(a) + parseDuration(b)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    return `PT${h ? h + 'H' : ''}${m ? m + 'M' : ''}${s ? s + 'S' : ''}`
}
