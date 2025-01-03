import { Router } from 'express'
import { prisma } from '../db'

const router = Router()

router.get('/', async (req, res) => {
    try {
        // Get pagination params from query
        const page = Number(req.query.page) || 0
        const pageSize = Number(req.query.pageSize) || 25
        const search = req.query.search as string | undefined

        console.log('Page:', page)
        console.log('Page Size:', pageSize)
        console.log('Search:', search)

        // Build where clause
        const where = search
            ? {
                  OR: [
                      {
                          title: {
                              contains: search,
                              mode: 'insensitive' as const,
                          },
                      },
                      {
                          channelTitle: {
                              contains: search,
                              mode: 'insensitive' as const,
                          },
                      },
                  ],
              }
            : undefined

        // Get total count for pagination
        const total = await prisma.video.count({ where })

        // Get paginated data
        const videos = await prisma.video.findMany({
            where,
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
            skip: page * pageSize,
            take: pageSize,
        })

        // Convert BigInt to string
        const serializedVideos = videos.map((video) => ({
            ...video,
            viewCount: video.viewCount?.toString() || null,
        }))

        res.json({
            data: serializedVideos,
            meta: {
                total,
                page,
                pageSize,
                pageCount: Math.ceil(total / pageSize),
            },
        })
    } catch (error) {
        console.error('Error fetching video data:', error)
        res.status(500).json({ error: 'Failed to fetch video data' })
    }
})

export default router
