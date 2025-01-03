import { Router } from 'express'
import { prisma } from '../db'

const router = Router()

interface TagStats {
    tag: string
    count: number
}

interface TopicStats {
    topic: string
    count: number
}

interface VideoWithTags {
    title: string
    viewCount: number | null
    tags: string[]
    likeCount: number | null
    commentCount: number | null
}

router.get('/word-maps', async (req, res) => {
    try {
        console.log('\n\nStarting word-maps analytics...')
        const startTime = Date.now()

        // Get all tags with their counts
        console.log('Fetching videos for tags...')
        const tagQueryStart = Date.now()
        const tagCounts = await prisma.video.findMany({
            select: {
                tags: true,
            },
        })
        console.log(`Tag query took ${Date.now() - tagQueryStart}ms`)
        console.log(`Retrieved ${tagCounts.length} videos`)

        // Process tags using Map for O(1) lookups
        console.log('Processing tags...')
        const tagProcessStart = Date.now()
        const allTags = tagCounts.flatMap((video) => video.tags)
        console.log(`Total tags to process: ${allTags.length}`)

        const tagMap = new Map<string, number>()
        allTags.forEach((tag) => {
            tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
        })

        const tagStats: TagStats[] = Array.from(tagMap.entries())
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count)

        console.log(`Tag processing took ${Date.now() - tagProcessStart}ms`)
        console.log(`Unique tags: ${tagStats.length}`)

        // Get all tags with their counts
        console.log('Fetching videos for topics...')
        const topicQueryStart = Date.now()
        const topicCounts = await prisma.video.findMany({
            select: {
                topicCategories: true,
            },
        })
        console.log(`Topic query took ${Date.now() - topicQueryStart}ms`)
        console.log(`Retrieved ${topicCounts.length} videos`)

        // Process topics using Map for O(1) lookups
        console.log('Processing topics...')
        const topicProcessStart = Date.now()
        const allTopics = topicCounts.flatMap((video) => video.topicCategories)

        const topicMap = new Map<string, number>()
        allTopics.forEach((topic) => {
            const topicName = new URL(topic).pathname.split('/').pop() || topic
            topicMap.set(topicName, (topicMap.get(topicName) || 0) + 1)
        })

        const topicStats: TopicStats[] = Array.from(topicMap.entries())
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count)

        console.log(`Topic processing took ${Date.now() - topicProcessStart}ms`)
        console.log(`Unique topics: ${topicStats.length}`)

        console.log(`\nTotal execution time: ${Date.now() - startTime}ms\n`)

        res.json({
            tags: tagStats,
            topics: topicStats,
        })
    } catch (error) {
        console.error('Error fetching analytics data:', error)
        res.status(500).json({ error: 'Failed to fetch analytics data' })
    }
})

router.get('/content-insights', async (req, res) => {
    try {
        const insights = await prisma.video.findMany({
            select: {
                title: true,
                viewCount: true,
                publishedAt: true,
                duration: true,
                tags: true,
                likeCount: true,
                commentCount: true,
            },
            orderBy: {
                viewCount: 'desc',
            },
            take: 100,
        })

        // Process insights to find patterns
        const patterns = {
            durationVsViews: insights.map((v) => ({
                duration: v.duration,
                views: Number(v.viewCount),
                title: v.title,
            })),
            publishingTimes: insights.map((v) => ({
                hour: v.publishedAt ? new Date(v.publishedAt).getHours() : null,
                views: Number(v.viewCount),
            })),
            tagPerformance: processTagPerformance(
                insights.map((v) => ({
                    ...v,
                    viewCount: v.viewCount ? Number(v.viewCount) : null,
                    likeCount: v.likeCount ? Number(v.likeCount) : null,
                    commentCount: v.commentCount
                        ? Number(v.commentCount)
                        : null,
                }))
            ),
        }

        res.json(patterns)
    } catch (error) {
        console.error('Error fetching content insights:', error)
        res.status(500).json({ error: 'Failed to fetch content insights' })
    }
})

function processTagPerformance(videos: VideoWithTags[]) {
    // Create a map to store tag pair performance
    const tagPairStats = new Map<
        string,
        {
            count: number
            totalViews: number
            videos: Array<{ title: string; views: number }>
        }
    >()

    // Analyze each video's tag pairs
    videos.forEach((video) => {
        // Look at each pair of tags
        for (let i = 0; i < video.tags.length; i++) {
            for (let j = i + 1; j < video.tags.length; j++) {
                // Create consistent key for tag pair
                const pair = [video.tags[i], video.tags[j]].sort().join('::')

                const existing = tagPairStats.get(pair) || {
                    count: 0,
                    totalViews: 0,
                    videos: [],
                }

                tagPairStats.set(pair, {
                    count: existing.count + 1,
                    totalViews: existing.totalViews + (video.viewCount || 0),
                    videos: [
                        ...existing.videos,
                        {
                            title: video.title,
                            views: Number(video.viewCount) || 0,
                        },
                    ]
                        .sort((a, b) => b.views - a.views)
                        .slice(0, 5),
                })
            }
        }
    })

    // Convert to array and sort by average views
    return Array.from(tagPairStats.entries())
        .map(([pair, stats]) => ({
            tags: pair.split('::'),
            count: stats.count,
            avgViews: stats.totalViews / stats.count,
            totalViews: stats.totalViews,
            topVideos: stats.videos,
        }))
        .filter((pair) => pair.count > 1) // Only pairs that appear multiple times
        .sort((a, b) => b.avgViews - a.avgViews)
        .slice(0, 20) // Top 20 performing pairs
}

export default router
