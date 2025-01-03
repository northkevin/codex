import type {
    BasicStats,
    ChannelStats,
    TimeStats,
    CategoryStats,
    AttributeStats,
} from './stats'

export interface ApiError {
    message: string
    status?: number
}

export interface StatsResponse {
    basicStats: BasicStats
    channelStats: ChannelStats
    timeStats: TimeStats
    categoryStats: CategoryStats
    attributeStats: AttributeStats
}
