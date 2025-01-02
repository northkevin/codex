import { PrismaClient } from '@prisma/client'
import { getBasicStats } from './basicStats'
import { getChannelStats } from './channelStats'
import { getTimeStats } from './timeStats'
import { getCategoryStats } from './categoryStats'
import type {
    BasicStats,
    ChannelStats,
    TimeStats,
    CategoryStats,
} from './types'

const prisma = new PrismaClient()

export interface StatsResponse {
    basic: BasicStats
    channels: ChannelStats
    time: TimeStats
    categories: CategoryStats
}

export async function getAllStats(minDate: Date): Promise<StatsResponse> {
    return {
        basic: await getBasicStats(prisma, minDate),
        channels: await getChannelStats(prisma, minDate),
        time: await getTimeStats(prisma, minDate),
        categories: await getCategoryStats(prisma, minDate),
    }
}
