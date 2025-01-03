import { Router } from 'express'
import { prisma } from '../db'
import { getBasicStats } from '../services/stats/basicStats'
import { getChannelStats } from '../services/stats/channelStats'
import { getTimeStats } from '../services/stats/timeStats'
import { getCategoryStats } from '../services/stats/categoryStats'
import { getAttributeStats } from '../services/stats/attributeStats'

const router = Router()

router.get('/', async (req, res) => {
    try {
        const [
            basicStats,
            channelStats,
            timeStats,
            categoryStats,
            attributeStats,
        ] = await Promise.all([
            getBasicStats(prisma, new Date('2017-01-01')),
            getChannelStats(prisma, new Date('2017-01-01')),
            getTimeStats(prisma, new Date('2017-01-01')),
            getCategoryStats(prisma, new Date('2017-01-01')),
            getAttributeStats(prisma),
        ])

        res.json({
            basicStats,
            channelStats,
            timeStats,
            categoryStats,
            attributeStats,
        })
    } catch (error) {
        console.error('Error fetching stats:', error)
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})

export default router
