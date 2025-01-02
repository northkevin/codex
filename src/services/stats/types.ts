export interface BasicStats {
    totalVideos: number
    uniqueChannels: number
    dateRange: {
        earliest: Date | null
        latest: Date | null
    }
}

export interface ChannelStats {
    topByCount: {
        channelTitle: string | null
        _count: {
            videoId: number
        }
    }[]
    topByDuration: {
        channelTitle: string | null
        totalDuration: string
        watchCount: number
    }[]
    topByCategory: {
        channelTitle: string | null
        categoryId: string | null
        _count: number
    }[]
}

export interface TimeStats {
    watchesByYear: Record<number, number>
    durationByYear: {
        watchedAt: Date
        _sum: {
            video: {
                duration: string | null
            }
        } | null
    }[]
}

export interface CategoryStats {
    categoryDistribution: {
        categoryId: string | null
        _count: number
    }[]
    podcastStats: {
        categoryId: string | null
        _count: number
    }[]
}
