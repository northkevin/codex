import { PrismaClient } from '@prisma/client'
import { prisma } from '../../db'
import type { CategoryStats } from './types'

export async function getCategoryStats(
    prisma: PrismaClient,
    minDate: Date
): Promise<CategoryStats> {
    const [categoryDistribution, podcastStats] = await Promise.all([
        // Overall category distribution
        prisma.video.groupBy({
            by: ['categoryId'],
            _count: true,
            where: {
                categoryId: { not: null },
                watches: { some: { watchedAt: { gte: minDate } } },
            },
            orderBy: { _count: { categoryId: 'desc' } },
        }),

        // Podcast-like content stats (long-form content)
        prisma.video.groupBy({
            by: ['categoryId'],
            _count: true,
            where: {
                categoryId: { not: null },
                watches: { some: { watchedAt: { gte: minDate } } },
                duration: { gt: 'PT1200S' }, // > 20 minutes
                OR: [
                    { categoryId: '22' }, // People & Blogs
                    { categoryId: '24' }, // Entertainment
                    { categoryId: '27' }, // Education
                ],
            },
        }),
    ])

    return { categoryDistribution, podcastStats }
}
