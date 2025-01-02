import express, { Request, Response } from 'express'
import { PrismaClient, Prisma } from '@prisma/client'
import cors from 'cors'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/stats', async (_req: Request, res: Response) => {
    try {
        const [
            totalVideos,
            uniqueChannels,
            topChannels,
            watchesByYear,
            dateRange
        ] = await Promise.all([
            prisma.video.count(),
            prisma.video.groupBy({
                by: ['channelId'],
                _count: true
            }),
            prisma.video.groupBy({
                by: ['channelTitle'],
                _count: {
                    videoId: true
                },
                orderBy: {
                    _count: {
                        videoId: 'desc'
                    }
                },
                take: 10
            }),
            prisma.watchHistory.groupBy({
                by: ['watchedAt'],
                _count: true,
                orderBy: {
                    watchedAt: 'asc'
                }
            }).then(results => {
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