import { PrismaClient } from '@prisma/client'
import { prisma } from '../../db'
import type { BasicStats } from './types'

export async function getBasicStats(
    prisma: PrismaClient,
    minDate: Date
): Promise<BasicStats> {
    const [totalVideos, uniqueChannels, dateRange] = await Promise.all([
        prisma.video.count({
            where: { watches: { some: { watchedAt: { gte: minDate } } } },
        }),
        prisma.video.groupBy({
            by: ['channelId'],
            where: { watches: { some: { watchedAt: { gte: minDate } } } },
        }),
        prisma.watchHistory.aggregate({
            _min: { watchedAt: true },
            _max: { watchedAt: true },
            where: { watchedAt: { gte: minDate } },
        }),
    ])

    return {
        totalVideos,
        uniqueChannels: uniqueChannels.length,
        dateRange: {
            earliest: dateRange._min.watchedAt,
            latest: dateRange._max.watchedAt,
        },
    }
}
