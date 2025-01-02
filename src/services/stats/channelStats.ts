import { PrismaClient } from '@prisma/client'
import type { ChannelStats } from './types'
import { parseDuration, addDurations } from '../../utils/duration'

interface ChannelDuration {
    channelTitle: string | null
    totalDuration: string
    watchCount: number
}

interface VideoWithWatches {
    channelTitle: string | null
    duration: string | null
    _count: {
        watches: number
    }
}

export async function getChannelStats(
    prisma: PrismaClient,
    minDate: Date
): Promise<ChannelStats> {
    const [topByCount, topByWatches, topByCategory] = await Promise.all([
        // Top channels by unique video count
        prisma.video.groupBy({
            by: ['channelTitle'],
            _count: { videoId: true },
            where: {
                channelTitle: { not: null },
                watches: { some: { watchedAt: { gte: minDate } } },
            },
            orderBy: {
                _count: { videoId: 'desc' },
            },
            take: 20,
        }),

        // Top channels by watch time
        prisma.video
            .findMany({
                select: {
                    channelTitle: true,
                    duration: true,
                    _count: {
                        select: { watches: true },
                    },
                },
                where: {
                    channelTitle: { not: null },
                    watches: { some: { watchedAt: { gte: minDate } } },
                },
                orderBy: {
                    watches: { _count: 'desc' },
                },
                take: 100,
            })
            .then((videos) => {
                // Group and sum durations by channel
                const channelDurations = (videos as VideoWithWatches[]).reduce<
                    Record<string, ChannelDuration>
                >((acc, video) => {
                    if (!video.channelTitle) return acc // Skip if no channel title

                    if (!acc[video.channelTitle]) {
                        acc[video.channelTitle] = {
                            channelTitle: video.channelTitle,
                            totalDuration: 'PT0S',
                            watchCount: 0,
                        }
                    }

                    const entry = acc[video.channelTitle]
                    entry.watchCount += video._count.watches

                    // Multiply duration by watch count and add to total
                    if (video.duration) {
                        for (let i = 0; i < video._count.watches; i++) {
                            entry.totalDuration = addDurations(
                                entry.totalDuration,
                                video.duration
                            )
                        }
                    }

                    return acc
                }, {})

                return Object.values(channelDurations)
                    .sort(
                        (a, b) =>
                            parseDuration(b.totalDuration) -
                            parseDuration(a.totalDuration)
                    )
                    .slice(0, 20)
            }),

        // Top channels by category
        prisma.video.groupBy({
            by: ['channelTitle', 'categoryId'],
            _count: true,
            where: {
                channelTitle: { not: null },
                watches: { some: { watchedAt: { gte: minDate } } },
            },
            orderBy: {
                _count: { videoId: 'desc' },
            },
            take: 100,
        }),
    ])

    return {
        topByCount,
        topByDuration: topByWatches,
        topByCategory,
    }
}
