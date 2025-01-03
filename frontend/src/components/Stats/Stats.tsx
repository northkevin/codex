import { useEffect, useState } from 'react'
import type { BasicStats, ChannelStats, TimeStats, CategoryStats, AttributeStats } from '../../types/stats'
import { BasicStatsSection } from './BasicStats'
import { ChannelStatsSection } from './ChannelStats'
import { TimeStatsSection } from './TimeStats'
import { CategoryStatsSection } from './CategoryStats'
import { AttributeStatsSection } from './AttributeStats'
import { getStats } from '../../api/stats'

export function Stats() {
    const [basicStats, setBasicStats] = useState<BasicStats | null>(null)
    const [channelStats, setChannelStats] = useState<ChannelStats | null>(null)
    const [timeStats, setTimeStats] = useState<TimeStats | null>(null)
    const [categoryStats, setCategoryStats] = useState<CategoryStats | null>(null)
    const [attributeStats, setAttributeStats] = useState<AttributeStats | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                const data = await getStats()
                setBasicStats(data.basicStats)
                setChannelStats(data.channelStats)
                setTimeStats(data.timeStats)
                setCategoryStats(data.categoryStats)
                setAttributeStats(data.attributeStats)
            } catch (error) {
                console.error('Failed to fetch stats:', error)
            }
        }
        fetchStats()
    }, [])

    if (!basicStats || !channelStats || !timeStats || !categoryStats || !attributeStats) {
        return <div className="loading">Loading stats...</div>
    }

    return (
        <div className="stats-container">
            <BasicStatsSection data={basicStats} />
            <ChannelStatsSection data={channelStats} />
            <TimeStatsSection data={timeStats} />
            <CategoryStatsSection data={categoryStats} />
            <AttributeStatsSection data={attributeStats} />
        </div>
    )
}
