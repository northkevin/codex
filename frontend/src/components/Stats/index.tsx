import { useStats } from '../../hooks/useStats'
import { BasicStats } from './BasicStats'
import { ChannelStats } from './ChannelStats'
import { TimeStats } from './TimeStats'
import { CategoryStats } from './CategoryStats'

export function Stats() {
    const { data: stats, isLoading, error } = useStats()

    if (isLoading) return <div className="loading">Loading stats...</div>
    if (error) return <div className="error">Failed to load stats</div>
    if (!stats) return null

    return (
        <div className="stats-container">
            <BasicStats data={stats.basic} />
            <ChannelStats data={stats.channels} />
            <TimeStats data={stats.time} />
            <CategoryStats data={stats.categories} />
        </div>
    )
}
