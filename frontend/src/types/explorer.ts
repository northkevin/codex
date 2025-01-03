export interface VideoData {
    videoId: string
    title: string
    categoryId: string | null
    tags: string[]
    viewCount: string | null
    duration: string | null
    channelTitle: string | null
    wasLivestream: boolean | null
    watches: {
        watchedAt: string
    }[]
}
