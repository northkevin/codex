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
    topByWatches: {
        channelTitle: string | null
        watch_count: number
    }[]
    topByDuration: {
        channelTitle: string | null
        totalDuration: string
        watch_count: number
    }[]
    topLivestreams: {
        channelTitle: string | null
        stream_count: number
        total_watches: number
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

export interface AttributeStats {
    productPlacement: {
        has: number
        none: number
        unknown: number
    }
    licensing: {
        licensed: number
        unlicensed: number
        unknown: number
    }
    privacy: {
        public: number
        other: number
        unknown: number
    }
    streaming: {
        livestream: number
        regular: number
    }
    metadata: {
        hasTags: number
        noTags: number
        hasTopics: number
        noTopics: number
    }
}
