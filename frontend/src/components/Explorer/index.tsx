import { useQuery } from '@tanstack/react-query'
import { explorerApi } from '../../api/client'
import { VideoTable } from './VideoTable'

import './Explorer.css'

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
            <VideoTable data={videos} />
        </div>
    )
}
