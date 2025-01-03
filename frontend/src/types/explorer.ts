export interface VideoData {
    videoId: string
    title: string
    description: string | null
    publishedAt: string
    channelId: string
    channelTitle: string | null
    categoryId: string | null
    tags: string[]
    viewCount: string | null
    likeCount: string | null
    commentCount: string | null
    duration: string | null
    wasLivestream: boolean
    licensedContent: boolean
    watches: {
        watchedAt: string
    }[]
    topicCategories: string[]
}
