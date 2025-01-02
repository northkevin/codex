import { PrismaClient } from '@prisma/client'
import type { TimeStats } from './types'
import { addDurations } from '../../utils/duration'

export async function getTimeStats(
    prisma: PrismaClient,
    minDate: Date
): Promise<TimeStats> {
    const [byYear, durationByYear] = await Promise.all([
        // Videos watched per year
        prisma.watchHistory
            .groupBy({
                by: ['watchedAt'],
                _count: true,
                where: {
                    watchedAt: { gte: minDate },
                },
                orderBy: {
                    watchedAt: 'asc',
                },
            })
            .then((results) => {
                // Group by year
                return results.reduce(
                    (acc, curr) => {
                        const year = curr.watchedAt.getFullYear()
                        acc[year] = (acc[year] || 0) + curr._count
                        return acc
                    },
                    {} as Record<number, number>
                )
            }),

        // Duration by year
        prisma.watchHistory
            .findMany({
                select: {
                    watchedAt: true,
                    video: {
                        select: {
                            duration: true,
                        },
                    },
                },
                where: {
                    watchedAt: { gte: minDate },
                    video: { duration: { not: null } },
                },
                orderBy: {
                    watchedAt: 'asc',
                },
            })
            .then((watches) => {
                // Group and sum durations by year
                return Object.entries(
                    watches.reduce(
                        (acc, watch) => {
                            const year = watch.watchedAt.getFullYear()
                            if (!acc[year]) acc[year] = 'PT0S'
                            if (watch.video.duration) {
                                acc[year] = addDurations(
                                    acc[year],
                                    watch.video.duration
                                )
                            }
                            return acc
                        },
                        {} as Record<number, string>
                    )
                ).map(([year, duration]) => ({
                    watchedAt: new Date(Number(year), 0, 1),
                    _sum: { video: { duration } },
                }))
            }),
    ])

    return { watchesByYear: byYear, durationByYear }
}
