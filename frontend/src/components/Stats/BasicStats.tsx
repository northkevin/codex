import type { BasicStats as BasicStatsType } from '../../types'
import { formatTimeSpan, formatDateRange } from '../../utils/format'

interface Props {
    data: BasicStatsType
}

export function BasicStatsSection({ data }: Props) {
    return (
        <div className="stat-section">
            <div className="basic-stats">
                <div className="stat-card">
                    <div className="stat-label">Total Videos</div>
                    <div className="stat-value">{data.totalVideos.toLocaleString()}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">Unique Channels</div>
                    <div className="stat-value">{data.uniqueChannels.toLocaleString()}</div>
                </div>

                <div className="stat-card">
                    <div className="stat-label">History Span</div>
                    <div className="stat-value">
                        {formatTimeSpan(data.dateRange.earliest, data.dateRange.latest)}
                    </div>
                    <div className="stat-subtext">
                        {formatDateRange(data.dateRange.earliest, data.dateRange.latest)}
                    </div>
                </div>
            </div>
        </div>
    )
}
