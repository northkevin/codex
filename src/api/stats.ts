import express, { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export const router = express.Router()

router.get('/stats', async (_req: Request, res: Response) => {
    try {
        const minDate = new Date('2017-01-01')

        const [
            totalVideos,
            uniqueChannels,
            topChannels,
            watchesByYear,
            dateRange
        ] = await Promise.all([
            prisma.video.count({
                where: {
                    watches: {
                        some: {
                            watchedAt: {
                                gte: minDate
                            }
                        }
                    }
                }
            }),
            prisma.video.groupBy({
                by: ['channelId'],
                _count: true,
                where: {
                    watches: {
                        some: {
                            watchedAt: {
                                gte: minDate
                            }
                        }
                    }
                }
            }),
            prisma.video.groupBy({
                by: ['channelTitle'],
                _count: {
                    videoId: true
                },
                where: {
                    watches: {
                        some: {
                            watchedAt: {
                                gte: minDate
                            }
                        }
                    }
                },
                orderBy: {
                    _count: {
                        videoId: 'desc'
                    }
                },
                take: 20
            }),
            prisma.watchHistory.groupBy({
                by: ['watchedAt'],
                _count: true,
                where: {
                    watchedAt: {
                        gte: minDate
                    }
                },
                orderBy: {
                    watchedAt: 'asc'
                }
            }).then((results: any[]) => {
                const yearCounts = results.reduce((acc, curr) => {
                    const year = new Date(curr.watchedAt).getFullYear()
                    acc[year] = (acc[year] || 0) + curr._count
                    return acc
                }, {} as Record<number, number>)

                return Object.entries(yearCounts).map(([year, count]) => ({
                    _key: parseInt(year),
                    _count: count
                }))
            }),
            prisma.watchHistory.aggregate({
                _min: {
                    watchedAt: true
                },
                _max: {
                    watchedAt: true
                },
                where: {
                    watchedAt: {
                        gte: minDate
                    }
                }
            })
        ])

        res.json({
            totalVideos,
            uniqueChannels: uniqueChannels.length,
            topChannels,
            watchesByYear,
            dateRange: {
                earliest: dateRange._min.watchedAt,
                latest: dateRange._max.watchedAt
            }
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to fetch stats' })
    }
})

export default router