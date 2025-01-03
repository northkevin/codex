import { useQuery } from '@tanstack/react-query'
import { explorerApi } from '../../api/client'
import type { VideoData } from '../../types/explorer'

export function Explorer() {
    const { data: videos, isLoading, error } = useQuery({
        queryKey: ['videos'],
        queryFn: explorerApi.getVideos,
    })

    if (isLoading) return <div className="loading">Loading videos...</div>
    if (error) return <div className="error">Failed to load videos</div>
    if (!videos) return null

    return (
        <div className="explorer-container">
            <h1>Video Explorer</h1>
            <pre>{JSON.stringify(videos.slice(0, 5), null, 2)}</pre>
        </div>
    )
}
