import type { ChannelStats as ChannelStatsType } from '../../types'
import { formatDuration } from '../../utils/format'

interface Props {
    data: ChannelStatsType
}

export function ChannelStatsSection({ data }: Props) {
    return (
        <div className="stat-section">
            <h2>Channel Statistics</h2>

            <div className="channels-grid">
                <div className="channel-list">
                    <h3>Most Unique Videos</h3>
                    {data.topByCount.map((channel, i) => (
                        <div key={channel.channelTitle} className="channel-item">
                            <span className="rank">#{i + 1}</span>
                            <span className="channel">{channel.channelTitle}</span>
                            <span className="count">
                                {channel._count.videoId.toLocaleString()} videos
                            </span>
                        </div>
                    ))}
                </div>

                <div className="channel-list">
                    <h3>Most Watch Events</h3>
                    {data.topByWatches.map((channel, i) => (
                        <div key={channel.channelTitle} className="channel-item">
                            <span className="rank">#{i + 1}</span>
                            <span className="channel">{channel.channelTitle}</span>
                            <span className="count">
                                {channel.watch_count.toLocaleString()} watches
                            </span>
                        </div>
                    ))}
                </div>

                <div className="channel-list">
                    <h3>Longest Watch Time</h3>
                    {data.topByDuration.map((channel, i) => (
                        <div key={channel.channelTitle} className="channel-item">
                            <span className="rank">#{i + 1}</span>
                            <span className="channel">{channel.channelTitle}</span>
                            <span className="duration">
                                {formatDuration(channel.totalDuration)} ({channel.watch_count}{' '}
                                watches)
                            </span>
                        </div>
                    ))}
                </div>

                <div className="channel-list">
                    <h3>Top Livestream Channels</h3>
                    {data.topLivestreams.map((channel, i) => (
                        <div key={channel.channelTitle} className="channel-item">
                            <span className="rank">#{i + 1}</span>
                            <span className="channel">{channel.channelTitle}</span>
                            <span className="count">
                                {channel.stream_count} streams ({channel.total_watches} watches)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
