import { PrismaClient } from '@prisma/client'
import type { ChannelStats } from './types'

export async function getChannelStats(
    prisma: PrismaClient,
    minDate: Date
): Promise<ChannelStats> {
    const [topByCount, topByDuration, topByCategory] = await Promise.all([
        // Top channels by video count
        prisma.video.groupBy({
            by: ['channelTitle'],
            _count: { videoId: true },
            where: {
                watches: { some: { watchedAt: { gte: minDate } } },
            },
            orderBy: { _count: { videoId: 'desc' } },
            take: 20,
        }),

        // Top channels by total watch duration
        prisma.video.groupBy({
            by: ['channelTitle'],
            _sum: { duration: true },
            where: {
                watches: { some: { watchedAt: { gte: minDate } } },
            },
            orderBy: { _sum: { duration: 'desc' } },
            take: 20,
        }),

        // Top channels by category distribution
        prisma.video.groupBy({
            by: ['channelTitle', 'categoryId'],
            _count: true,
            where: {
                watches: { some: { watchedAt: { gte: minDate } } },
            },
            orderBy: { _count: 'desc' },
            take: 100, // Get more to analyze distribution
        }),
    ])

    return { topByCount, topByDuration, topByCategory }
}
