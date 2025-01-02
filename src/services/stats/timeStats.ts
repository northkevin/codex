import { PrismaClient } from '@prisma/client'
import type { TimeStats } from './types'

export async function getTimeStats(
    prisma: PrismaClient,
    minDate: Date
): Promise<TimeStats> {
    const [watchesByYear, durationByYear] = await Promise.all([
        // Videos per year
        prisma.watchHistory
            .groupBy({
                by: ['watchedAt'],
                _count: true,
                where: { watchedAt: { gte: minDate } },
                orderBy: { watchedAt: 'asc' },
            })
            .then((results) => {
                return results.reduce(
                    (acc, curr) => {
                        const year = new Date(curr.watchedAt).getFullYear()
                        acc[year] = (acc[year] || 0) + curr._count
                        return acc
                    },
                    {} as Record<number, number>
                )
            }),

        // Total duration by year
        prisma.watchHistory.groupBy({
            by: ['watchedAt'],
            _sum: { video: { select: { duration: true } } },
            where: { watchedAt: { gte: minDate } },
            orderBy: { watchedAt: 'asc' },
        }),
    ])

    return { watchesByYear, durationByYear }
}
