import { useStats } from '../../hooks/useStats'
import { BasicStatsSection } from './BasicStats'
import { ChannelStatsSection } from './ChannelStats'
import { TimeStatsSection } from './TimeStats'
import { CategoryStatsSection } from './CategoryStats'
import { AttributeStatsSection } from './AttributeStats'
import './Stats.css'

export function Stats() {
    const { data: stats, isLoading, error } = useStats()

    if (isLoading) return <div className="loading">Loading stats...</div>
    if (error) return <div className="error">Failed to load stats</div>
    if (!stats) return null

    return (
        <div className="stats-container">
            <BasicStatsSection data={stats.basicStats} />
            <ChannelStatsSection data={stats.channelStats} />
            <TimeStatsSection data={stats.timeStats} />
            <CategoryStatsSection data={stats.categoryStats} />
            <AttributeStatsSection data={stats.attributeStats} />
        </div>
    )
}
