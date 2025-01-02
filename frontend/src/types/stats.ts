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
        channelTitle: string
        _count: {
            videoId: number
        }
    }[]
    topByDuration: {
        channelTitle: string
        _sum: {
            duration: string | null
        }
    }[]
    topByCategory: {
        channelTitle: string
        categoryId: string
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
        categoryId: string
        _count: number
    }[]
    podcastStats: {
        categoryId: string
        _count: number
    }[]
}
