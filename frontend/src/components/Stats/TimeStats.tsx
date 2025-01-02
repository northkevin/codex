import type { TimeStats as TimeStatsType } from '../../types'

interface Props {
    data: TimeStatsType
}

export function TimeStats({ data }: Props) {
    const years = Object.entries(data.watchesByYear)
        .sort(([a], [b]) => Number(a) - Number(b))

    const maxCount = Math.max(...Object.values(data.watchesByYear))

    return (
        <div className="stat-section">
            <h2>Yearly Watch History</h2>
            <div className="year-stats">
                {years.map(([year, count]) => (
                    <div key={year} className="year-item">
                        <span className="year">{year}</span>
                        <div
                            className="bar"
                            style={{ width: `${(count / maxCount) * 100}%` }}
                        />
                        <span className="count">
                            {count.toLocaleString()} videos
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
