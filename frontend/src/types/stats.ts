export interface DateRange {
    earliest: string;
    latest: string;
}

export interface TopChannel {
    channelTitle: string;
    _count: {
        videoId: number;
    };
}

export interface YearStat {
    _key: number;
    _count: number;
}

export interface Stats {
    totalVideos: number;
    uniqueChannels: number;
    topChannels: TopChannel[];
    watchesByYear: YearStat[];
    dateRange: DateRange;
} 