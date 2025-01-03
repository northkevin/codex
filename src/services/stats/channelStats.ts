import { PrismaClient } from '@prisma/client'
import { prisma } from '../../db'
import type { ChannelStats } from './types'
import { parseDuration, addDurations } from '../../utils/duration'

interface ChannelDuration {
    channelTitle: string | null
    totalDuration: string
    watchCount: number
}

interface VideoWithWatches {
    channelTitle: string | null
    duration: string | null
    _count: {
        watches: number
    }
}

export async function getChannelStats(
    prisma: PrismaClient,
    minDate: Date
): Promise<ChannelStats> {
    const [topByCount, topByWatches, topByDuration, topLivestreams] =
        await Promise.all([
            // 1. Top channels by unique videos count (excluding livestreams)
            prisma.video.groupBy({
                by: ['channelTitle'],
                _count: { videoId: true },
                where: {
                    channelTitle: { not: null },
                    wasLivestream: false,
                },
                orderBy: {
                    _count: { videoId: 'desc' },
                },
                take: 20,
            }),

            // 2. Top channels by total watch events (excluding livestreams)
            prisma.$queryRaw<
                { channelTitle: string | null; watch_count: number }[]
            >`
            SELECT
                v.channel_title as "channelTitle",
                COUNT(w.id)::int as watch_count
            FROM videos v
            LEFT JOIN watch_history w ON w.video_id = v.video_id
            WHERE v.channel_title IS NOT NULL
                AND w.watched_at >= ${minDate}
                AND v.was_livestream = false
            GROUP BY v.channel_title
            ORDER BY watch_count DESC
            LIMIT 20
        `,

            // 3. Top channels by total watch duration (excluding livestreams)
            prisma.$queryRaw<
                {
                    channelTitle: string | null
                    totalDuration: string
                    watch_count: number
                }[]
            >`
            WITH parsed_durations AS (
                SELECT
                    v.channel_title,
                    v.duration::interval as duration_interval
                FROM videos v
                JOIN watch_history w ON w.video_id = v.video_id
                WHERE v.channel_title IS NOT NULL
                    AND w.watched_at >= ${minDate}
                    AND v.duration IS NOT NULL
                    AND v.was_livestream = false
            ),
            summed_durations AS (
                SELECT
                    channel_title,
                    SUM(EXTRACT(EPOCH FROM duration_interval))::bigint as total_seconds,
                    COUNT(*)::int as watch_count
                FROM parsed_durations
                GROUP BY channel_title
            )
            SELECT
                channel_title as "channelTitle",
                CONCAT(
                    'PT',
                    FLOOR(total_seconds / 3600)::text, 'H',
                    FLOOR((total_seconds % 3600) / 60)::text, 'M',
                    (total_seconds % 60)::text, 'S'
                ) as "totalDuration",
                watch_count
            FROM summed_durations
            ORDER BY total_seconds DESC
            LIMIT 20
        `,

            // 4. Top livestream channels (separate category)
            prisma.$queryRaw<
                {
                    channelTitle: string | null
                    stream_count: number
                    total_watches: number
                }[]
            >`
            WITH parsed_durations AS (
                SELECT
                    v.channel_title,
                    COUNT(w.id)::int as watch_count,
                    v.duration::interval as duration_interval
                FROM videos v
                JOIN watch_history w ON w.video_id = v.video_id
                WHERE v.channel_title IS NOT NULL
                    AND w.watched_at >= ${minDate}
                    AND v.duration IS NOT NULL
                    AND v.was_livestream = true
                GROUP BY v.channel_title, v.duration
            )
            SELECT
                channel_title as "channelTitle",
                COUNT(*)::int as stream_count,
                SUM(watch_count)::int as total_watches
            FROM parsed_durations
            GROUP BY channel_title
            ORDER BY total_watches DESC
            LIMIT 10
        `,
        ])

    return {
        topByCount,
        topByWatches,
        topByDuration,
        topLivestreams,
    }
}
