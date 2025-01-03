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
                case 'publishedAt':
                    orderBy = [
                        {
                            publishedAt: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'channelTitle':
                    orderBy = [
                        {
                            channelTitle: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'description':
                    orderBy = [
                        {
                            description: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'likeCount':
                    orderBy = [
                        {
                            likeCount: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'commentCount':
                    orderBy = [
                        {
                            commentCount: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'duration':
                    orderBy = [
                        {
                            duration: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'licensedContent':
                    orderBy = [
                        {
                            licensedContent: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'topicCategories':
                    orderBy = [{ topicCategories: sort.desc ? 'desc' : 'asc' }]
                    break
                case 'wasLivestream':
                    orderBy = [
                        {
                            wasLivestream: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'channelId':
                    orderBy = [
                        {
                            channelId: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'categoryId':
                    orderBy = [
                        {
                            categoryId: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
                    break
                case 'tags':
                    orderBy = [{ tags: sort.desc ? 'desc' : 'asc' }]
                    break

                default:
                    orderBy = [
                        {
                            [sort.id]: {
                                sort: sort.desc ? 'desc' : 'asc',
                                nulls: 'last',
                            },
                        },
                    ]
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
                description: true,
                publishedAt: true,
                channelId: true,
                channelTitle: true,
                categoryId: true,
                tags: true,
                viewCount: true,
                likeCount: true,
                commentCount: true,
                duration: true,
                wasLivestream: true,
                licensedContent: true,
                watches: {
                    select: {
                        watchedAt: true,
                    },
                },
                topicCategories: true,
            },
            orderBy,
            skip: page * pageSize,
            take: pageSize,
        })

        const sortByField = sortBy ? sortBy[0].id : 'viewCount'
        // Debug log the first few results
        console.log(
            'First few results:',
            videos.slice(0, 3).map((v) => ({
                title: v.title,
                sort: sortByField,
                // viewCount: v.viewCount?.toString(),

                ...(sortByField && {
                    [sortByField]:
                        typeof v[sortByField as keyof typeof v] === 'bigint'
                            ? v[sortByField as keyof typeof v]?.toString()
                            : v[sortByField as keyof typeof v],
                }),
            }))
        )

        const serializedVideos = videos.map((video) => ({
            ...video,
            viewCount: video.viewCount?.toString() || null,
            likeCount: video.likeCount?.toString() || null,
            commentCount: video.commentCount?.toString() || null,
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
