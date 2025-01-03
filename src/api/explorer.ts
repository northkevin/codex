import { Router } from 'express'
import { prisma } from '../db'
import { Prisma } from '@prisma/client'

const router = Router()

interface SortConfig {
    id: string
    desc: boolean
}

router.get('/', async (req, res) => {
    try {
        const page = Number(req.query.page) || 0
        const pageSize = Number(req.query.pageSize) || 25
        const search = req.query.search as string | undefined
        const sortBy = req.query.sortBy
            ? (JSON.parse(req.query.sortBy as string) as SortConfig[])
            : undefined

        console.log('Sort config:', sortBy) // Debug log

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

        // Build orderBy clause
        let orderBy: Prisma.VideoOrderByWithRelationInput[] = []

        if (sortBy && sortBy.length > 0) {
            const sort = sortBy[0]
            switch (sort.id) {
                case 'viewCount':
                    orderBy = [
                        // First sort by nulls last
                        {
                            viewCount: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                        // Tiebreaker by title
                        { title: 'asc' },
                    ]
                    break
                case 'watches':
                    orderBy = [
                        { watches: { _count: sort.desc ? 'desc' : 'asc' } },
                    ]
                    break
                default:
                    orderBy = [{ [sort.id]: sort.desc ? 'desc' : 'asc' }]
            }
        } else {
            orderBy = [{ watches: { _count: 'desc' } }]
        }

        console.log('Final orderBy:', JSON.stringify(orderBy, null, 2)) // Debug log

        // Get total count
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
            orderBy,
            skip: page * pageSize,
            take: pageSize,
        })

        // Debug log the first few results
        console.log(
            'First few results:',
            videos.slice(0, 3).map((v) => ({
                title: v.title,
                viewCount: v.viewCount?.toString(),
            }))
        )

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
