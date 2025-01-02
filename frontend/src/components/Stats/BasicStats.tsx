import { formatDistance } from 'date-fns'
import type { BasicStats as BasicStatsType } from '../../types'

interface Props {
    data: BasicStatsType
}

export function BasicStats({ data }: Props) {
    const dateRange = formatDistance(
        new Date(data.dateRange.earliest!),
        new Date(data.dateRange.latest!)
    )

    return (
        <div className="stats-grid">
            <div className="stat-card">
                <h2>Total Videos</h2>
                <div className="stat-value">{data.totalVideos.toLocaleString()}</div>
            </div>
            <div className="stat-card">
                <h2>Unique Channels</h2>
                <div className="stat-value">{data.uniqueChannels.toLocaleString()}</div>
            </div>
            <div className="stat-card">
                <h2>History Span</h2>
                <div className="stat-value">{dateRange}</div>
            </div>
        </div>
    )
}
