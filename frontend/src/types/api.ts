// Common API response wrapper
export interface ApiResponse<T> {
    data: T
    error?: string
}

// Stats response matches our backend types
export interface StatsResponse {
    basic: BasicStats
    channels: ChannelStats
    time: TimeStats
    categories: CategoryStats
}
