import { Router } from 'express'
import { prisma } from '../db'

const router = Router()

router.get('/', async (req, res) => {
    try {
        const videos = await prisma.video.findMany({
            select: {
                videoId: true,
                title: true,
                categoryId: true,
                tags: true,
                viewCount: true,
                duration: true,
                channelTitle: true,
                wasLivestream: true,
                watches: {
                    select: {
                        watchedAt: true,
                    },
                },
            },
            orderBy: {
                watches: {
                    _count: 'desc',
                },
            },
            take: 100, // Start with limited results for testing
        })

        // Convert BigInt to string before sending
        const serializedVideos = videos.map((video) => ({
            ...video,
            viewCount: video.viewCount?.toString() || null,
        }))

        res.json(serializedVideos)
    } catch (error) {
        console.error('Error fetching video data:', error)
        res.status(500).json({ error: 'Failed to fetch video data' })
    }
})

export default router
